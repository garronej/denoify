import * as commentJson from "comment-json";
import { getGithubDefaultBranchName } from "get-github-default-branch-name";
import fetch from "node-fetch";
import * as path from "path";
import { id } from "tsafe";
import { assert } from "tsafe/assert";
import { exclude } from "tsafe/exclude";
import { addCache } from "../../tools/addCache";
import { getLatestTag } from "../../tools/githubTags";
import { is404 } from "../../tools/is404";
("");
import { isInsideOrIsDir } from "../../tools/isInsideOrIsDir";
import { toPosix } from "../../tools/toPosix";
import { urlJoin } from "../../tools/urlJoin";
import { getFileTypeAndContent } from "../config/fileAndContent";
import { parseAsDenoifyConfig } from "../config/parseParams";
import { getCurrentStdVersion } from "../getCurrentStdVersion";
import { getThirdPartyDenoModuleInfos } from "../getThirdPartyDenoModuleInfos";
import { ModuleAddress } from "../types/ModuleAddress";
import { GetValidImportUrl } from "./resolveNodeModuleToDenoModule";
import { getRemoteFileContents } from "../../tools/getFileContents";

type ValidImportUrlResult =
    | {
          couldConnect: false;
      }
    | {
          couldConnect: true;
          versionFallbackWarning: string | undefined;
          getValidImportUrl: GetValidImportUrl;
      };

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

type UrlBuilderParams = { candidateBranch: string; pathToFile: string };

/**
 * Perform no check, just synchronously assemble the url
 * from a ModuleAddress, a branch and a path to file.
 * */
export function buildUrlFactory(params: { moduleAddress: ModuleAddress }) {
    const { moduleAddress } = params;

    switch (moduleAddress.type) {
        case "NODE BUILTIN":
            return () => `node:moduleAddress.name`;
        case "GITHUB REPO":
            return ({ candidateBranch, pathToFile }: UrlBuilderParams) =>
                urlJoin(
                    "https://raw.githubusercontent.com",
                    moduleAddress.userOrOrg,
                    moduleAddress.repositoryName,
                    candidateBranch,
                    toPosix(pathToFile)
                );
        case "DENO.LAND URL":
            return ({ candidateBranch, pathToFile }: UrlBuilderParams) =>
                urlJoin([moduleAddress.baseUrlWithoutBranch.replace(/\/$/, ""), `@${candidateBranch}`].join(""), toPosix(pathToFile));
        case "GITHUB-RAW URL":
            return ({ candidateBranch, pathToFile }: UrlBuilderParams) =>
                urlJoin(moduleAddress.baseUrlWithoutBranch.replace(/\/$/, ""), candidateBranch, toPosix(pathToFile));
    }
}

async function* candidateBranches(params: Params): AsyncGenerator<[string, false | { version: string }]> {
    const { moduleAddress } = params;

    let fallback: false | { version: string } = false;

    if (moduleAddress.type === "DENO.LAND URL" && moduleAddress.isStd) {
        yield [await getCurrentStdVersion(), fallback];

        return undefined;
    }

    if (moduleAddress.type === "NODE BUILTIN") {
        yield ["", fallback];

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

/**
 * Figure out the `outDir` for a module in GitHub by looking at tsconfig.json
 */
const getTsconfigOutDir = addCache(async (params: { moduleAddress: ModuleAddress.GitHubRepo; gitTag: string }): Promise<string | undefined> => {
    const { moduleAddress, gitTag } = params;

    const tsconfigJson = await getRemoteFileContents({ committish: gitTag, filename: "tsconfig.json", moduleAddress });

    if (tsconfigJson === undefined) {
        return undefined;
    }

    const outDir: string | undefined = commentJson.parse(tsconfigJson)["compilerOptions"]?.["outDir"];

    if (typeof outDir !== "string") {
        return undefined;
    }

    return path.normalize(toPosix(outDir));
});

const getExplicitDenoifyOutDir = addCache(async (params: { gitTag: string; moduleAddress: ModuleAddress.GitHubRepo }) => {
    const { gitTag, moduleAddress } = params;

    const denoifyOut = parseAsDenoifyConfig({
        "configFileType": await getFileTypeAndContent({
            "getConfigFileRawContent": (file: string) => getRemoteFileContents({ committish: gitTag, filename: file, moduleAddress })
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

        const denoifyOutDir = await getExplicitDenoifyOutDir({ moduleAddress, gitTag });

        if (denoifyOutDir !== undefined) {
            return denoifyOutDir;
        }

        const tsconfigOutDir = await getTsconfigOutDir({ moduleAddress, gitTag });

        if (tsconfigOutDir !== undefined) {
            return path.join(
                path.dirname(tsconfigOutDir), // .
                `deno_${path.basename(tsconfigOutDir)}` //deno_dist
            ); // deno_dist
        }

        return undefined;
    }
);

async function resolveVersion(params: Params) {
    const { moduleAddress } = params;

    const buildUrl = buildUrlFactory({ moduleAddress });

    for await (const [candidateBranch, fallback] of candidateBranches(params)) {
        let indexUrl: string;

        switch (moduleAddress.type) {
            case "NODE BUILTIN":
                continue;
            case "DENO.LAND URL":
            case "GITHUB-RAW URL": {
                indexUrl = buildUrl({ candidateBranch, pathToFile: moduleAddress.pathToIndex });

                if (!(await is404(indexUrl))) {
                    break;
                }

                continue;
                {
                }
            }
            case "GITHUB REPO": {
                const denoifyOutDir = await getDenoifyOutDir({ moduleAddress, "gitTag": candidateBranch });

                if (denoifyOutDir === undefined) {
                    continue;
                }

                indexUrl = buildUrl({ candidateBranch, pathToFile: path.join(denoifyOutDir, "mod.ts") });

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

export const getValidImportUrlFactory = addCache(async (params: Params): Promise<ValidImportUrlResult> => {
    const { moduleAddress } = params;

    const buildUrl = buildUrlFactory({ moduleAddress });

    const versionResolutionResult = await resolveVersion(params);

    if (versionResolutionResult === undefined) {
        return { "couldConnect": false };
    }

    const { branchForVersion, versionFallbackWarning, indexUrl } = versionResolutionResult;

    const denoifyOutDir = moduleAddress.type !== "GITHUB REPO" ? undefined : await getDenoifyOutDir({ moduleAddress, "gitTag": branchForVersion });

    const getValidImportUrl = addCache(
        id<GetValidImportUrl>(async params => {
            if (params.target === "DEFAULT EXPORT") {
                return indexUrl;
            }

            const { specificImportPath } = params;

            let url = await (async () => {
                const pathToFile = await (async () => {
                    switch (moduleAddress.type) {
                        case "NODE BUILTIN":
                            return moduleAddress.name;
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

                return buildUrl({ candidateBranch: branchForVersion, pathToFile });
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

            const regExpMatchArray = validRawGitHubUserContentUrl.match(/^https:\/\/raw\.githubusercontent\.com\/[^\/]+\/([^\/]+)+\/([^\/]+)\/(.*)$/);

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
