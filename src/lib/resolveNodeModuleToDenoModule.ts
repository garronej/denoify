
import { getProjectRoot } from "../tools/getProjectRoot";
import * as fs from "fs";
import { ModuleAddress } from "./types/ModuleAddress";
import { is404 } from "../tools/is404";
import { urlJoin } from "../tools/urlJoin";
import { getGithubDefaultBranchName } from "get-github-default-branch-name";
import { getThirdPartyDenoModuleInfos } from "./getThirdPartyDenoModuleInfos";
import fetch from "node-fetch";
import * as commentJson from "comment-json";
import * as path from "path";
import { getCurrentStdVersion } from "./getCurrentStdVersion";
import type { getInstalledVersionPackageJsonFactory } from "./getInstalledVersionPackageJson";
import { addCache } from "../tools/addCache";
import { toPosix } from "../tools/toPosix";
import { id } from "tsafe";
import { getLatestTag } from "../tools/githubTags";
import { isInsideOrIsDir } from "../tools/isInsideOrIsDir";

const knownPorts: { [nodeModuleName: string]: string; } = (() => {

    const { third_party, builtins } =
        commentJson.parse(
            fs.readFileSync(
                path.join(getProjectRoot(), "known-ports.jsonc")
            ).toString("utf8")
        );

    return {
        ...third_party,
        ...builtins
    };

})();

type GetValidImportUrl = (params: {
    target: "DEFAULT EXPORT";
} | {
    target: "SPECIFIC FILE";
    specificImportPath: string; // e.g tools/typeSafety ( no .ts ext )
}) => Promise<string>;

type Result = {
    result: "SUCCESS";
    getValidImportUrl: GetValidImportUrl;
} | {
    result: "NON-FATAL UNMET DEPENDENCY";
    kind: "DEV DEPENDENCY" | "BUILTIN"
};

export function resolveNodeModuleToDenoModuleFactory(
    params: {
        userProvidedPorts: { [nodeModuleName: string]: string; };
        dependencies: { [nodeModuleName: string]: string; };
        devDependencies: { [nodeModuleName: string]: string; };
        log: typeof console.log;
    } & ReturnType<typeof getInstalledVersionPackageJsonFactory>
) {

    const { log, getInstalledVersionPackageJson } = params;

    const { denoPorts } = (() => {

        const denoPorts: { [nodeModuleName: string]: string; } = {};

        [knownPorts, params.userProvidedPorts].forEach(
            record => Object.keys(record).forEach(nodeModuleName =>
                denoPorts[nodeModuleName] = record[nodeModuleName]
            )
        );

        return { denoPorts };

    })();


    const allDependencies = {
        ...params.dependencies,
        ...params.devDependencies
    };

    const devDependenciesNames = Object.keys(params.devDependencies);


    const isInUserProvidedPort = (nodeModuleName: string) =>
        nodeModuleName in params.userProvidedPorts
        ;


    const resolveNodeModuleToDenoModule = addCache(async (
        params: { nodeModuleName: string; }
    ): Promise<Result> => {

        const {
            nodeModuleName //js-yaml
        } = params;

        walk: {

            if (nodeModuleName in allDependencies) {
                break walk;
            }

            if (!(nodeModuleName in denoPorts)) {

                return {
                    "result": "NON-FATAL UNMET DEPENDENCY",
                    "kind": "BUILTIN"
                };

            }

            const getValidImportUrlFactoryResult = await
                getValidImportUrlFactory({
                    "moduleAddress": ModuleAddress.parse(denoPorts[nodeModuleName]),
                    "desc": "NOT LISTED AS A DEPENDENCY (PROBABLY NODE BUILTIN)"
                });

            if (!getValidImportUrlFactoryResult.couldConnect) {

                return {
                    "result": "NON-FATAL UNMET DEPENDENCY",
                    "kind": "BUILTIN"
                };

            }

            const { getValidImportUrl } = getValidImportUrlFactoryResult;

            return {
                "result": "SUCCESS",
                getValidImportUrl
            }

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
        } = await getInstalledVersionPackageJson({ nodeModuleName })
            .catch(() => {

                log([
                    `${nodeModuleName} could not be found in the node_module directory`,
                    `seems like you needs to re-install your project dependency ( npm install )`
                ].join(" "));

                process.exit(-1);

            });


        if (gitHubRepo === undefined) {

            gitHubRepo = (() => {

                const repositoryUrl = repositoryEntryOfPackageJson?.["url"];

                if (!repositoryUrl) {
                    return undefined;
                }

                const [repositoryName, userOrOrg] =
                    repositoryUrl
                        .replace(/\.git$/i, "")
                        .split("/")
                        .filter((s: string) => !!s)
                        .reverse()
                    ;

                if (!repositoryName || !userOrOrg) {
                    return undefined;
                }

                return ModuleAddress.GitHubRepo.parse(`github:${userOrOrg}/${repositoryName}`);

            })();

        }


        walk: {

            if (gitHubRepo === undefined) {
                break walk;
            }

            const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
                "moduleAddress": gitHubRepo,
                "desc": "MATCH VERSION INSTALLED IN NODE_MODULE",
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
                log([
                    `NOTE: ${nodeModuleName} is a denoified module,`,
                    `there is no need for an entry for in package.json denoPorts`
                ].join(" "));
            }


            return {
                result: "SUCCESS",
                getValidImportUrl
            };

        }

        walk: {

            if (!(nodeModuleName in denoPorts)) {
                break walk;
            }

            const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
                "moduleAddress": ModuleAddress.parse(denoPorts[nodeModuleName]),
                "desc": "MATCH VERSION INSTALLED IN NODE_MODULE",
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


        if (devDependenciesNames.includes(nodeModuleName)) {

            return {
                "result": "NON-FATAL UNMET DEPENDENCY",
                "kind": "DEV DEPENDENCY"
            };

        }

        throw new Error(`You need to provide a deno port for ${nodeModuleName}`);

    });

    return { resolveNodeModuleToDenoModule };

}

/** Exported only for tests purpose */
export const { getValidImportUrlFactory } = (() => {

    type Params =
        {
            moduleAddress: ModuleAddress;
        } & ({
            desc: "NOT LISTED AS A DEPENDENCY (PROBABLY NODE BUILTIN)";
        } | {
            desc: "MATCH VERSION INSTALLED IN NODE_MODULE";
            version: string
        })
        ;

    type Result = {
        couldConnect: false;
    } | {
        couldConnect: true;
        versionFallbackWarning: string | undefined;
        getValidImportUrl: GetValidImportUrl;
    };


    /** 
      * Perform no check, just synchronously assemble the url 
      * from a ModuleAddress, a branch and a path to file.
      * */
    function buildUrlFactory(params: { moduleAddress: ModuleAddress; }) {
        const { moduleAddress } = params;

        const buildUrl = ((): ((
            candidateBranch: string, //e.g: deno_latest
            pathToFile: string //e.g: tools/typeSafety/assert.ts
        ) => string) => {
            switch (moduleAddress.type) {
                case "GITHUB REPO":
                    return (candidateBranch, pathToFile) => urlJoin(
                        "https://raw.githubusercontent.com",
                        moduleAddress.userOrOrg,
                        moduleAddress.repositoryName,
                        candidateBranch,
                        toPosix(pathToFile)
                    );
                case "DENO.LAND URL":
                    return (candidateBranch, pathToFile) => urlJoin(
                        [
                            moduleAddress.baseUrlWithoutBranch.replace(/\/$/, ""),
                            `@${candidateBranch}`
                        ].join(""),
                        toPosix(pathToFile)
                    );
                case "GITHUB-RAW URL":
                    return (candidateBranch, pathToFile) => urlJoin(
                        moduleAddress.baseUrlWithoutBranch.replace(/\/$/, ""),
                        candidateBranch,
                        toPosix(pathToFile)
                    );
            }
        })();
        return { buildUrl };
    }

    async function* candidateBranches(
        params: Params
    ): AsyncGenerator<[string, false | { version: string; }]> {

        const { moduleAddress } = params;

        let fallback: false | { version: string; } = false;

        if (moduleAddress.type === "DENO.LAND URL" && moduleAddress.isStd) {

            yield [await getCurrentStdVersion(), fallback];

            return undefined;

        }

        if (params.desc === "MATCH VERSION INSTALLED IN NODE_MODULE") {
            const { version } = params;
            yield ["v" + version, fallback];
            yield [version, fallback];

            fallback = { version };

        }

        if (moduleAddress.branch !== undefined) {
            yield [moduleAddress.branch, fallback];
        }

        switch (moduleAddress.type) {
            case "GITHUB-RAW URL": return undefined;
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

                    const latestVersion = (await getThirdPartyDenoModuleInfos({ 
                        "denoModuleName": moduleAddress.baseUrlWithoutBranch.split("/").reverse()[0]
                    }))?.latestVersion;

                    if (latestVersion === undefined) {
                        break;
                    }

                    yield [latestVersion, fallback];

                }

                break;
        }
    }


    /** Throws if 404 */
    const getTsconfigOutDir = addCache(async (
        params: {
            moduleAddress: ModuleAddress.GitHubRepo;
            branchForVersion: string;
        }
    ): Promise<string> => {

        const { branchForVersion, moduleAddress } = params;

        const { buildUrl } = buildUrlFactory({ moduleAddress });

        return path.normalize(
            commentJson.parse(
                await fetch(
                    buildUrl(
                        branchForVersion,
                        "tsconfig.json"
                    )
                ).then(res => res.text())
            )["compilerOptions"]["outDir"]
        );

    });


    async function resolveVersion(params: Params) {

        const { moduleAddress } = params;

        const { buildUrl } = buildUrlFactory({ moduleAddress });

        for await (const [candidateBranch, fallback] of candidateBranches(params)) {

            let indexUrl: string;

            switch (moduleAddress.type) {
                case "DENO.LAND URL":
                case "GITHUB-RAW URL": {

                    indexUrl = buildUrl(candidateBranch, moduleAddress.pathToIndex)

                    if (!await is404(indexUrl)) {
                        break;
                    }

                    continue;

                }
                case "GITHUB REPO": {


                    const tsConfigOutDir = await getTsconfigOutDir({
                        moduleAddress,
                        "branchForVersion": candidateBranch
                    })
                        .catch(() => undefined);

                    if (tsConfigOutDir === undefined) {
                        /*
                        NOTE: When we have a GITHUB REPO it 
                        must point to a denoified module.
                        */
                        continue;
                    }

                    indexUrl = buildUrl(
                        candidateBranch,
                        path.join(
                            `deno_${path.basename(tsConfigOutDir)}`,
                            "mod.ts"
                        )
                    );

                    if (!await is404(indexUrl)) {
                        break;
                    }

                    continue;

                }
            }

            return {
                "branchForVersion": candidateBranch,
                "versionFallbackWarning": !fallback ?
                    undefined :
                    `Can't lookup version ${
                    fallback.version
                    } for module ${
                    JSON.stringify(moduleAddress)
                    }, falling back to ${
                    candidateBranch
                    }`,
                indexUrl
            };

        }

        return undefined;

    }






    const getValidImportUrlFactory = addCache(async (
        params: Params
    ): Promise<Result> => {

        const { moduleAddress } = params;

        const { buildUrl } = buildUrlFactory({ moduleAddress });

        const versionResolutionResult = await resolveVersion(params);

        if (versionResolutionResult === undefined) {

            return { "couldConnect": false };

        }

        const { branchForVersion, versionFallbackWarning, indexUrl } = versionResolutionResult;


        const getValidImportUrl = addCache(id<GetValidImportUrl>(async params => {

            if (params.target === "DEFAULT EXPORT") {

                return indexUrl;

            }

            const { specificImportPath } = params;

            let url = buildUrl(
                branchForVersion,
                await (async () => {
                    switch (moduleAddress.type) {
                        case "DENO.LAND URL":
                        case "GITHUB-RAW URL":

                            return `${specificImportPath}.ts`;

                        case "GITHUB REPO":

                            const tsConfigOutDir = await getTsconfigOutDir({
                                moduleAddress,
                                branchForVersion
                            });

                            return path.join(
                                path.join(
                                    path.dirname(tsConfigOutDir), // .
                                    `deno_${path.basename(tsConfigOutDir)}`//deno_dist
                                ), // deno_dist
                                isInsideOrIsDir({ "dirPath": tsConfigOutDir, "fileOrDirPath": specificImportPath }) ?
                                    path.relative(
                                        tsConfigOutDir,
                                        specificImportPath // dist/tools/typeSafety
                                    ) //  tools/typeSafety 
                                    : specificImportPath // tools/typeSafety ( when using enable short path )
                            ) // deno_dist/tool/typeSafety
                                + ".ts" // deno_dist/tool/typeSafety.ts

                    }
                })()
            );

            walk: {

                if (await is404(url)) {
                    break walk;
                }

                return url;

            }

            url = url
                .replace(/\.ts$/, "/index.ts")
                // https://.../deno_dist/tool/typeSafety/index.ts
                ;

            walk: {

                if (await is404(url)) {
                    break walk;
                }

                return url;

            }

            throw new Error(`Can't locate ${specificImportPath} from ${JSON.stringify(moduleAddress)}`);

        }));

        return {
            "couldConnect": true,
            versionFallbackWarning,
            getValidImportUrl
        }

    });


    return { getValidImportUrlFactory };

})();

