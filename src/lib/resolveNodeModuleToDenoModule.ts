
import * as st from "scripting-tools";
import { getProjectRoot } from "../tools/getProjectRoot";
import * as fs from "fs";
import { ModuleAddress } from "./types/ModuleAddress";
import { is404 } from "../tools/is404";
import { urlJoin } from "../tools/urlJoin";
import { getGithubDefaultBranchName } from "get-github-default-branch-name";
import { getDenoThirdPartyModuleDatabase } from "./denoThirdPartyModuleDb";
import fetch from "node-fetch";
import * as commentJson from "comment-json";
import * as path from "path";
import { addCache } from "../tools/addCache";
import { getCurrentStdVersion } from "./getCurrentStdVersion";

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

export type NodeToDenoModuleResolutionResult = {
    result: "SUCCESS";
    getValidImportUrl: GetValidImportUrl;
} | {
    result: "NON-FATAL UNMET DEPENDENCY";
    kind: "DEV DEPENDENCY" | "BUILTIN"
};

export function resolveNodeModuleToDenoModuleFactory(
    params: {
        projectPath: string;
        userProvidedPorts: { [nodeModuleName: string]: string; };
        dependencies: { [nodeModuleName: string]: string; };
        devDependencies: { [nodeModuleName: string]: string; };
        log: typeof console.log;
    }
) {

    const { log } = params;

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

    const getTargetModulePath = (nodeModuleName: string) =>
        st.find_module_path(
            nodeModuleName,
            params.projectPath
        );

    const isInUserProvidedPort = (nodeModuleName: string) =>
        nodeModuleName in params.userProvidedPorts
        ;


    const resolveNodeModuleToDenoModule = addCache(async (
        params: { nodeModuleName: string; }
    ): Promise<NodeToDenoModuleResolutionResult> => {

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
                    "desc": "NO SPECIFIC VERSION PRESENT IN NODE_MODULE ( PROBABLY NODE BUILTIN)"
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
        } = JSON.parse(
            fs.readFileSync(
                path.join(
                    getTargetModulePath(nodeModuleName), // node_modules/js-yaml
                    "package.json"
                )
            ).toString("utf8")
        );

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

            const { versionFallbackWarning, isDenoified } = getValidImportUrlFactoryResult;

            if (!isDenoified) {
                break walk;
            }


            if (versionFallbackWarning) {
                log(versionFallbackWarning);
            }

            if (isInUserProvidedPort(nodeModuleName)) {
                log([
                    `NOTE: ${nodeModuleName} is a denoified module,`,
                    `there is no need for an entry for in package.json denoPorts`
                ].join(" "));
            }

            const { getValidImportUrl } = getValidImportUrlFactoryResult;

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
            desc: "NO SPECIFIC VERSION PRESENT IN NODE_MODULE ( PROBABLY NODE BUILTIN)";
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
        isDenoified: boolean;
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
            pathToFile?: string //e.g: tools/typeSafety/assert.ts
        ) => string) => {
            switch (moduleAddress.type) {
                case "GITHUB REPO":
                    return (candidateBranch, pathToFile) => urlJoin(
                        "https://raw.githubusercontent.com",
                        moduleAddress.userOrOrg,
                        moduleAddress.repositoryName,
                        candidateBranch,
                        pathToFile ?? "mod.ts"
                    );
                case "DENO.LAND URL":
                    return (candidateBranch, pathToFile) => urlJoin(
                        [
                            moduleAddress.baseUrlWithoutBranch.replace(/\/$/, ""),
                            `@${candidateBranch}`
                        ].join(""),
                        pathToFile ?? moduleAddress.pathToIndex
                    );
                case "GITHUB-RAW URL":
                    return (candidateBranch, pathToFile) => urlJoin(
                        moduleAddress.baseUrlWithoutBranch.replace(/\/$/, ""),
                        candidateBranch,
                        pathToFile ?? moduleAddress.pathToIndex
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
            yield [version, fallback];
            yield ["v" + version, fallback];

            fallback = { version };

        }

        if (moduleAddress.branch !== undefined) {
            yield [moduleAddress.branch, fallback];
        }

        switch (moduleAddress.type) {
            case "GITHUB REPO":

                walk: {

                    const database = await getDenoThirdPartyModuleDatabase();

                    const entry = Object.keys(database)
                        .map(moduleName => database[moduleName])
                        .find(({ owner, repo }) => (
                            owner === moduleAddress.userOrOrg &&
                            repo === moduleAddress.repositoryName
                        ))
                        ;

                    if (entry === undefined) {
                        break walk;
                    }

                    yield [entry.default_version, fallback];

                }


                yield ["deno_latest", fallback];


                yield [
                    await getGithubDefaultBranchName({
                        "owner": moduleAddress.userOrOrg,
                        "repo": moduleAddress.repositoryName
                    }),
                    fallback
                ]

                break;
            case "GITHUB-RAW URL":
                //NOTE: Always a branch specified that should prevail.
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

                    const default_version =
                        await getDenoThirdPartyModuleDatabase()
                            .then(
                                database => database[
                                    moduleAddress.baseUrlWithoutBranch.split("/").reverse()[0]
                                ]?.default_version
                            );


                    if (default_version === undefined) {
                        break;
                    }

                    yield [
                        default_version,
                        fallback
                    ];

                }

                break;
        }
    }

    async function resolveVersion(params: Params) {

        const { buildUrl } = buildUrlFactory({ "moduleAddress": params.moduleAddress });

        for await (const [candidateBranch, fallback] of candidateBranches(params)) {

            const url = buildUrl(candidateBranch);

            if (await is404(url)) {
                continue;
            }

            return {
                "branchForVersion": candidateBranch,
                "versionFallbackWarning": !fallback ?
                    undefined :
                    `Can't match ${fallback.version}, falling back to ${candidateBranch} branch`


            };


        }

        return undefined;




    }

    async function isDenoified(
        params: {
            moduleAddress: ModuleAddress;
            branchForVersion: string;
        }
    ): Promise<boolean> {

        const { moduleAddress, branchForVersion } = params;
        const { buildUrl } = buildUrlFactory({ moduleAddress });

        let modTsRaw: string;

        try {

            modTsRaw = await fetch(buildUrl(branchForVersion))
                .then(res => res.text())
                ;

        } catch{


            return false;

        }

        if (!modTsRaw.match(/denoify/i)) {


            return false;
        }


        return true;


    }

    /** Asserts denoified module */
    async function getTsconfigOutDir(
        params: {
            moduleAddress: ModuleAddress;
            branchForVersion: string;
        }
    ): Promise<string> {

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
        )
            ;
    };




    const getValidImportUrlFactory = addCache(async (
        params: Params
    ): Promise<Result> => {

        const { moduleAddress } = params;

        const { buildUrl } = buildUrlFactory({ moduleAddress });

        const versionResolutionResult = await resolveVersion(params);


        if (versionResolutionResult === undefined) {

            return { "couldConnect": false };

        }

        const { branchForVersion, versionFallbackWarning } = versionResolutionResult;


        const tsconfigOutDir = await (async () => {

            if (!(await isDenoified({ moduleAddress, branchForVersion }))) {
                return undefined;
            }

            return getTsconfigOutDir({ branchForVersion, moduleAddress });

        })();

        const getValidImportUrl: GetValidImportUrl = async params => {

            if (params.target === "DEFAULT EXPORT") {

                return buildUrl(branchForVersion);

            }

            const { specificImportPath } = params;

            for (const fixedTsConfigOutDir of [
                !tsconfigOutDir ? "dist" : tsconfigOutDir.replace(/\\/g, "/"),
                undefined
            ]) {

                let url = buildUrl(
                    branchForVersion,
                    (fixedTsConfigOutDir === undefined ?
                        specificImportPath
                        :
                        path.posix.join(
                            path.posix.join(
                                path.posix.dirname(fixedTsConfigOutDir), // .
                                `deno_${path.posix.basename(fixedTsConfigOutDir)}`//deno_dist
                            ), // deno_dist
                            path.posix.relative(
                                fixedTsConfigOutDir,
                                specificImportPath // dest/tools/typeSafety
                            ) //  tools/typeSafety
                        ) // deno_dist/tool/typeSafety
                    ) + ".ts" // deno_dist/tool/typeSafety.ts
                )


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

            }

            throw new Error(`Can't locate ${specificImportPath}`);
        };

        return {
            "couldConnect": true,
            versionFallbackWarning,
            "isDenoified": tsconfigOutDir !== undefined,
            "getValidImportUrl": addCache(getValidImportUrl)
        }

    });


    return { getValidImportUrlFactory };

})();

