import { ModuleAddress } from "../types/ModuleAddress";
import { is404 } from "../../tools/is404";
import { urlJoin } from "../../tools/urlJoin";
import { getGithubDefaultBranchName } from "get-github-default-branch-name";
import { getThirdPartyDenoModuleInfos } from "../getThirdPartyDenoModuleInfos";
import fetch from "node-fetch";
import * as commentJson from "comment-json";
import * as path from "path";
import { getCurrentStdVersion } from "../getCurrentStdVersion";
import type { getInstalledVersionPackageJsonFactory } from "../getInstalledVersionPackageJson";
import { addCache } from "../../tools/addCache";
import { toPosix } from "../../tools/toPosix";
import { id } from "tsafe";
import { getLatestTag } from "../../tools/githubTags";
import { isInsideOrIsDir } from "../../tools/isInsideOrIsDir";
import { knownPorts } from "./knownPorts";
import { assert } from "tsafe/assert";
import { exclude } from "tsafe/exclude";
import getFileTypeAndContent from "../config/fileAndContent";
import { parseAsDenoifyConfig } from "../config/parseParams";

type GetValidImportUrl = (
    params:
        | {
              target: "DEFAULT EXPORT";
          }
        | {
              target: "SPECIFIC FILE";
              specificImportPath: string; // e.g tools/typeSafety ( no .ts ext )
          }
) => Promise<string>;

type Result =
    | {
          result: "SUCCESS";
          getValidImportUrl: GetValidImportUrl;
      }
    | {
          result: "UNKNOWN BUILTIN";
      };

export function resolveNodeModuleToDenoModuleFactory(
    params: {
        userProvidedPorts: { [nodeModuleName: string]: string };
        dependencies: { [nodeModuleName: string]: string };
        devDependencies: { [nodeModuleName: string]: string };
        log: typeof console.log;
    } & ReturnType<typeof getInstalledVersionPackageJsonFactory>
) {
    const { log, getInstalledVersionPackageJson } = params;

    const { denoPorts } = (() => {
        const denoPorts: { [nodeModuleName: string]: string } = {};

        [knownPorts.third_party, knownPorts.builtins, params.userProvidedPorts].forEach(record =>
            Object.keys(record).forEach(nodeModuleName => (denoPorts[nodeModuleName] = record[nodeModuleName]))
        );

        return { denoPorts };
    })();

    const allDependencies = {
        ...params.dependencies,
        ...params.devDependencies
    };

    const isInUserProvidedPort = (nodeModuleName: string) => nodeModuleName in params.userProvidedPorts;
    const resolveNodeModuleToDenoModule = addCache(async (params: { nodeModuleName: string }): Promise<Result> => {
        const {
            nodeModuleName //js-yaml
        } = params;

        walk: {
            if (nodeModuleName in allDependencies) {
                break walk;
            }

            if (!(nodeModuleName in denoPorts)) {
                return { "result": "UNKNOWN BUILTIN" };
            }

            const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
                "moduleAddress": ModuleAddress.parse(denoPorts[nodeModuleName]),
                "desc": "NOT LISTED AS A DEPENDENCY (PROBABLY NODE BUILTIN)"
            });

            if (!getValidImportUrlFactoryResult.couldConnect) {
                return { "result": "UNKNOWN BUILTIN" };
            }

            const { getValidImportUrl } = getValidImportUrlFactoryResult;

            return {
                "result": "SUCCESS",
                getValidImportUrl
            };
        }

        let gitHubRepo: ModuleAddress.GitHubRepo | undefined = undefined;

        if (ModuleAddress.GitHubRepo.match(allDependencies[nodeModuleName])) {
            /*
            If we are here then:
            allDependencies[nodeModuleName] === "github:garronej/ts-md5#1.2.7"
            else: 
            allDependencies[nodeModuleName] === "^1.2.3"
            */
            gitHubRepo = ModuleAddress.GitHubRepo.parse(allDependencies[nodeModuleName]);
        }

        const {
            version, // 3.13.1 (version installed)
            repository: repositoryEntryOfPackageJson
        } = await getInstalledVersionPackageJson({ nodeModuleName }).catch(() => {
            log(
                [
                    `${nodeModuleName} could not be found in the node_module directory`,
                    `seems like you needs to re-install your project dependency ( npm install )`
                ].join(" ")
            );

            process.exit(-1);
        });

        if (gitHubRepo === undefined) {
            gitHubRepo = (() => {
                const repositoryUrl = repositoryEntryOfPackageJson?.["url"];

                if (!repositoryUrl) {
                    return undefined;
                }

                const [repositoryName, userOrOrg] = repositoryUrl
                    .replace(/\.git$/i, "")
                    .split("/")
                    .filter((s: string) => !!s)
                    .reverse();
                if (!repositoryName || !userOrOrg) {
                    return undefined;
                }

                return ModuleAddress.GitHubRepo.parse(`github:${userOrOrg}/${repositoryName}`);
            })();
        }

        walk: {
            if (!(nodeModuleName in denoPorts)) {
                break walk;
            }

            const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
                "moduleAddress": ModuleAddress.parse(denoPorts[nodeModuleName]),
                "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
                version
            });

            if (!getValidImportUrlFactoryResult.couldConnect) {
                log([
                    `WARNING: Even if the port ${denoPorts[nodeModuleName]}`,
                    `was specified for ${nodeModuleName} we couldn't connect to the repo`
                ]);
                break walk;
            }

            const { versionFallbackWarning, getValidImportUrl } = getValidImportUrlFactoryResult;

            if (versionFallbackWarning) {
                log(versionFallbackWarning);
            }

            return {
                "result": "SUCCESS",
                getValidImportUrl
            };
        }

        walk: {
            if (gitHubRepo === undefined) {
                break walk;
            }

            const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
                "moduleAddress": gitHubRepo,
                "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
                version
            });

            if (!getValidImportUrlFactoryResult.couldConnect) {
                break walk;
            }

            const { versionFallbackWarning, getValidImportUrl } = getValidImportUrlFactoryResult;

            if (versionFallbackWarning) {
                log(versionFallbackWarning);
            }

            if (isInUserProvidedPort(nodeModuleName)) {
                log([`NOTE: ${nodeModuleName} is a denoified module,`, `there is no need for an entry for in package.json denoPorts`].join(" "));
            }

            return {
                result: "SUCCESS",
                getValidImportUrl
            };
        }

        return {
            "result": "SUCCESS",
            "getValidImportUrl": params =>
                Promise.resolve(
                    `npm:${nodeModuleName}@${version}${(() => {
                        switch (params.target) {
                            case "DEFAULT EXPORT":
                                return "";
                            case "SPECIFIC FILE":
                                return `/${params.specificImportPath}`;
                        }
                    })()}`
                )
        };
    });

    return { resolveNodeModuleToDenoModule };
}

export type ValidImportUrlResult =
    | {
          couldConnect: false;
      }
    | {
          couldConnect: true;
          versionFallbackWarning: string | undefined;
          getValidImportUrl: GetValidImportUrl;
      };

/** Exported only for tests purpose */
export const { getValidImportUrlFactory } = (() => {
    type Params = {
        moduleAddress: ModuleAddress;
    } & (
        | {
              desc: "NOT LISTED AS A DEPENDENCY (PROBABLY NODE BUILTIN)";
          }
        | {
              desc: "MATCH VERSION INSTALLED IN NODE_MODULES";
              version: string;
          }
    );

    /**
     * Perform no check, just synchronously assemble the url
     * from a ModuleAddress, a branch and a path to file.
     * */
    function buildUrlFactory(params: { moduleAddress: ModuleAddress }) {
        const { moduleAddress } = params;

        const buildUrl = ((): ((
            candidateBranch: string, //e.g: deno_latest
            pathToFile: string //e.g: tools/typeSafety/assert.ts
        ) => string) => {
            switch (moduleAddress.type) {
                case "GITHUB REPO":
                    return (candidateBranch, pathToFile) =>
                        urlJoin(
                            "https://raw.githubusercontent.com",
                            moduleAddress.userOrOrg,
                            moduleAddress.repositoryName,
                            candidateBranch,
                            toPosix(pathToFile)
                        );
                case "DENO.LAND URL":
                    return (candidateBranch, pathToFile) =>
                        urlJoin([moduleAddress.baseUrlWithoutBranch.replace(/\/$/, ""), `@${candidateBranch}`].join(""), toPosix(pathToFile));
                case "GITHUB-RAW URL":
                    return (candidateBranch, pathToFile) =>
                        urlJoin(moduleAddress.baseUrlWithoutBranch.replace(/\/$/, ""), candidateBranch, toPosix(pathToFile));
            }
        })();
        return { buildUrl };
    }

    async function* candidateBranches(params: Params): AsyncGenerator<[string, false | { version: string }]> {
        const { moduleAddress } = params;

        let fallback: false | { version: string } = false;

        if (moduleAddress.type === "DENO.LAND URL" && moduleAddress.isStd) {
            yield [await getCurrentStdVersion(), fallback];

            return undefined;
        }

        if (params.desc === "MATCH VERSION INSTALLED IN NODE_MODULES") {
            const { version } = params;
            yield ["v" + version, fallback];
            yield [version, fallback];

            fallback = { version };
        }

        if (moduleAddress.branch !== undefined) {
            yield [moduleAddress.branch, fallback];
        }

        switch (moduleAddress.type) {
            case "GITHUB-RAW URL":
                return undefined;
            case "GITHUB REPO":
                const latestTag = await getLatestTag({
                    "owner": moduleAddress.userOrOrg,
                    "repo": moduleAddress.repositoryName
                });

                if (latestTag !== undefined) {
                    yield [latestTag, fallback];
                }

                yield [
                    await getGithubDefaultBranchName({
                        "owner": moduleAddress.userOrOrg,
                        "repo": moduleAddress.repositoryName
                    }),
                    fallback
                ];

                break;
            case "DENO.LAND URL":
                if (moduleAddress.branch !== undefined) {
                    break;
                }

                if (moduleAddress.isStd) {
                    yield [
                        await getGithubDefaultBranchName({
                            "owner": "denoland",
                            "repo": "deno"
                        }),
                        fallback
                    ];
                } else {
                    const latestVersion = (
                        await getThirdPartyDenoModuleInfos({
                            "denoModuleName": moduleAddress.baseUrlWithoutBranch.split("/").reverse()[0]
                        })
                    )?.latestVersion;

                    if (latestVersion === undefined) {
                        break;
                    }

                    yield [latestVersion, fallback];
                }

                break;
        }
    }

    const getTsconfigOutDir = addCache(async (params: { moduleAddress: ModuleAddress.GitHubRepo; gitTag: string }): Promise<string | undefined> => {
        const { moduleAddress, gitTag } = params;

        const { buildUrl } = buildUrlFactory({ moduleAddress });

        const tsconfigJson = await fetch(buildUrl(gitTag, "tsconfig.json")).then(
            res => (`${res.status}`.startsWith("2") ? res.text() : undefined),
            () => undefined
        );

        if (tsconfigJson === undefined) {
            return undefined;
        }

        const outDir: string | undefined = commentJson.parse(tsconfigJson)["compilerOptions"]?.["outDir"];

        if (typeof outDir !== "string") {
            return undefined;
        }

        return path.normalize(toPosix(outDir));
    });

    const { getDenoifyOutDir } = (() => {
        const getExplicitDenoifyOutDir = addCache(async (params: { gitTag: string; moduleAddress: ModuleAddress.GitHubRepo }) => {
            const { gitTag, moduleAddress } = params;
            const { buildUrl } = buildUrlFactory({ moduleAddress });

            const denoifyOut = parseAsDenoifyConfig({
                "configFileType": await getFileTypeAndContent({
                    "getConfigFileRawContent": async file =>
                        await fetch(buildUrl(gitTag, file)).then(
                            res => (`${res.status}`.startsWith("2") ? res.text() : undefined),
                            () => undefined
                        )
                })
            })?.out;

            if (denoifyOut === undefined) {
                return undefined;
            }

            return path.normalize(toPosix(denoifyOut));
        });

        const getDenoifyOutDir = addCache(
            async (params: {
                //TODO: Through out the codebase we name "branch" what are better described by tags.
                //Maybe we should use the consecrated therm "targetCommitish"
                gitTag: string;
                moduleAddress: ModuleAddress.GitHubRepo;
            }) => {
                const { gitTag, moduleAddress } = params;

                explicitely_specified: {
                    const denoifyOutDir = await getExplicitDenoifyOutDir({ moduleAddress, gitTag });

                    if (denoifyOutDir === undefined) {
                        break explicitely_specified;
                    }

                    return denoifyOutDir;
                }

                default_based_on_tsconfig_outDir: {
                    const tsconfigOutDir = await getTsconfigOutDir({ moduleAddress, gitTag });

                    if (tsconfigOutDir === undefined) {
                        break default_based_on_tsconfig_outDir;
                    }

                    return path.join(
                        path.dirname(tsconfigOutDir), // .
                        `deno_${path.basename(tsconfigOutDir)}` //deno_dist
                    ); // deno_dist
                }

                return undefined;
            }
        );

        return { getDenoifyOutDir };
    })();

    async function resolveVersion(params: Params) {
        const { moduleAddress } = params;

        const { buildUrl } = buildUrlFactory({ moduleAddress });

        for await (const [candidateBranch, fallback] of candidateBranches(params)) {
            let indexUrl: string;

            switch (moduleAddress.type) {
                case "DENO.LAND URL":
                case "GITHUB-RAW URL": {
                    indexUrl = buildUrl(candidateBranch, moduleAddress.pathToIndex);

                    if (!(await is404(indexUrl))) {
                        break;
                    }

                    continue;
                }
                case "GITHUB REPO": {
                    const denoifyOutDir = await getDenoifyOutDir({ moduleAddress, "gitTag": candidateBranch });

                    if (denoifyOutDir === undefined) {
                        continue;
                    }

                    indexUrl = buildUrl(candidateBranch, path.join(denoifyOutDir, "mod.ts"));

                    if (await is404(indexUrl)) {
                        continue;
                    }

                    break;
                }
            }

            return {
                "branchForVersion": candidateBranch,
                "versionFallbackWarning": !fallback
                    ? undefined
                    : `Can't lookup version ${fallback.version} for module ${JSON.stringify(moduleAddress)}, falling back to ${candidateBranch}`,
                indexUrl
            };
        }

        return undefined;
    }

    const getValidImportUrlFactory = addCache(async (params: Params): Promise<ValidImportUrlResult> => {
        const { moduleAddress } = params;

        const { buildUrl } = buildUrlFactory({ moduleAddress });

        const versionResolutionResult = await resolveVersion(params);

        if (versionResolutionResult === undefined) {
            return { "couldConnect": false };
        }

        const { branchForVersion, versionFallbackWarning, indexUrl } = versionResolutionResult;

        const denoifyOutDir =
            moduleAddress.type !== "GITHUB REPO" ? undefined : await getDenoifyOutDir({ moduleAddress, "gitTag": branchForVersion });

        const getValidImportUrl = addCache(
            id<GetValidImportUrl>(async params => {
                if (params.target === "DEFAULT EXPORT") {
                    return indexUrl;
                }

                const { specificImportPath } = params;

                let url = await (async () => {
                    const pathToFile = await (async () => {
                        switch (moduleAddress.type) {
                            case "DENO.LAND URL":
                                return moduleAddress.isStd
                                    ? `${moduleAddress.pathToIndex.replace(/\.ts$/, "")}/${specificImportPath}.ts`
                                    : `${specificImportPath}.ts`;
                            case "GITHUB-RAW URL":
                                return `${specificImportPath}.ts`;
                            case "GITHUB REPO":
                                //NOTE: resolveVersion was successful so we can assert that:
                                assert(denoifyOutDir !== undefined);

                                const tsconfigOutDir = await getTsconfigOutDir({ moduleAddress, "gitTag": branchForVersion });

                                return (
                                    path.join(
                                        denoifyOutDir, //deno_dist
                                        tsconfigOutDir !== undefined &&
                                            isInsideOrIsDir({ "dirPath": tsconfigOutDir, "fileOrDirPath": specificImportPath })
                                            ? path.relative(
                                                  tsconfigOutDir, // dist
                                                  specificImportPath // dist/tools/typeSafety
                                              ) //  tools/typeSafety
                                            : specificImportPath // tools/typeSafety ( when using enable short path )
                                    ) + // deno_dist/tool/typeSafety
                                    ".ts"
                                ); // deno_dist/tool/typeSafety.ts
                        }
                    })();

                    return buildUrl(branchForVersion, pathToFile);
                })();

                walk: {
                    if (await is404(url)) {
                        break walk;
                    }

                    return url;
                }

                url = url.replace(/\.ts$/, "/index.ts");
                // https://.../deno_dist/tool/typeSafety/index.ts

                walk: {
                    if (await is404(url)) {
                        break walk;
                    }

                    return url;
                }

                throw new Error(`Can't locate ${specificImportPath} from ${JSON.stringify(moduleAddress)}`);
            })
        );

        const rawGitHubUserContentUrlToDenoLandXUrl = addCache(
            async (params: { validRawGitHubUserContentUrl: string; denoifyOutDir: string }): Promise<string> => {
                const { validRawGitHubUserContentUrl, denoifyOutDir } = params;

                // https://raw.githubusercontent.com/garronej/tsafe/v0.10.1/deno_dist/assert.ts;
                // https://deno.land/x/tsafe@v0.10.1/assert.ts

                const regExpMatchArray = validRawGitHubUserContentUrl.match(
                    /^https:\/\/raw\.githubusercontent\.com\/[^\/]+\/([^\/]+)+\/([^\/]+)\/(.*)$/
                );

                assert(regExpMatchArray !== null);

                const [, repoName, version, fullPathToFile] = regExpMatchArray;

                for (const moduleName of [repoName.replace(/-/g, "_"), repoName.replace(/-/g, "")]) {
                    const buildDenoLandXUrl = (pathToFile: string) => urlJoin("https://deno.land/x", `${moduleName}@${version}`, toPosix(pathToFile));

                    for (const pathToFile of [
                        isInsideOrIsDir({ "dirPath": denoifyOutDir, "fileOrDirPath": fullPathToFile })
                            ? path.relative(denoifyOutDir, fullPathToFile)
                            : undefined,
                        fullPathToFile
                    ].filter(exclude(undefined))) {
                        const denoLandXUrl = buildDenoLandXUrl(pathToFile);

                        const fetchResponse = await fetch(denoLandXUrl, { "timeout": 4000 });

                        if (fetchResponse.status === 404 || fetchResponse.status === 400) {
                            continue;
                        }

                        const [denoLandXRawFileContent, gitHubUserContentFileContent] = await Promise.all([
                            fetchResponse.text(),
                            fetch(validRawGitHubUserContentUrl).then(resp => resp.text())
                        ]);

                        if (denoLandXRawFileContent !== gitHubUserContentFileContent) {
                            continue;
                        }

                        return denoLandXUrl;
                    }
                }

                return validRawGitHubUserContentUrl;
            }
        );

        return {
            "couldConnect": true,
            versionFallbackWarning,
            "getValidImportUrl":
                moduleAddress.type !== "GITHUB REPO"
                    ? getValidImportUrl
                    : async params =>
                          rawGitHubUserContentUrlToDenoLandXUrl({
                              "validRawGitHubUserContentUrl": await getValidImportUrl(params),
                              "denoifyOutDir": (assert(denoifyOutDir !== undefined), denoifyOutDir)
                          })
        };
    });

    return { getValidImportUrlFactory };
})();
