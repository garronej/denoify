"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidImportUrlFactory = exports.resolveNodeModuleToDenoModuleFactory = void 0;
const getProjectRoot_1 = require("../tools/getProjectRoot");
const fs = require("fs");
const ModuleAddress_1 = require("./types/ModuleAddress");
const is404_1 = require("../tools/is404");
const urlJoin_1 = require("../tools/urlJoin");
const get_github_default_branch_name_1 = require("get-github-default-branch-name");
const getThirdPartyDenoModuleInfos_1 = require("./getThirdPartyDenoModuleInfos");
const node_fetch_1 = require("node-fetch");
const commentJson = require("comment-json");
const path = require("path");
const addCache_1 = require("../tools/addCache");
const getCurrentStdVersion_1 = require("./getCurrentStdVersion");
const knownPorts = (() => {
    const { third_party, builtins } = commentJson.parse(fs.readFileSync(path.join(getProjectRoot_1.getProjectRoot(), "known-ports.jsonc")).toString("utf8"));
    return {
        ...third_party,
        ...builtins
    };
})();
function resolveNodeModuleToDenoModuleFactory(params) {
    const { log, getInstalledVersionPackageJson } = params;
    const { denoPorts } = (() => {
        const denoPorts = {};
        [knownPorts, params.userProvidedPorts].forEach(record => Object.keys(record).forEach(nodeModuleName => denoPorts[nodeModuleName] = record[nodeModuleName]));
        return { denoPorts };
    })();
    const allDependencies = {
        ...params.dependencies,
        ...params.devDependencies
    };
    const devDependenciesNames = Object.keys(params.devDependencies);
    const isInUserProvidedPort = (nodeModuleName) => nodeModuleName in params.userProvidedPorts;
    const resolveNodeModuleToDenoModule = addCache_1.addCache(async (params) => {
        const { nodeModuleName //js-yaml
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
            const getValidImportUrlFactoryResult = await exports.getValidImportUrlFactory({
                "moduleAddress": ModuleAddress_1.ModuleAddress.parse(denoPorts[nodeModuleName]),
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
            };
        }
        let gitHubRepo = undefined;
        if (ModuleAddress_1.ModuleAddress.GitHubRepo.match(allDependencies[nodeModuleName])) {
            /*
            If we are here then:
            allDependencies[nodeModuleName] === "github:garronej/ts-md5#1.2.7"
            else:
            allDependencies[nodeModuleName] === "^1.2.3"
            */
            gitHubRepo = ModuleAddress_1.ModuleAddress.GitHubRepo.parse(allDependencies[nodeModuleName]);
        }
        const { version, // 3.13.1 (version installed)
        repository: repositoryEntryOfPackageJson } = await getInstalledVersionPackageJson({ nodeModuleName })
            .catch(() => {
            log([
                `${nodeModuleName} could not be found in the node_module directory`,
                `seems like you needs to re-install your project dependency ( npm install )`
            ].join(" "));
            process.exit(-1);
        });
        if (gitHubRepo === undefined) {
            gitHubRepo = (() => {
                const repositoryUrl = repositoryEntryOfPackageJson === null || repositoryEntryOfPackageJson === void 0 ? void 0 : repositoryEntryOfPackageJson["url"];
                if (!repositoryUrl) {
                    return undefined;
                }
                const [repositoryName, userOrOrg] = repositoryUrl
                    .replace(/\.git$/i, "")
                    .split("/")
                    .filter((s) => !!s)
                    .reverse();
                if (!repositoryName || !userOrOrg) {
                    return undefined;
                }
                return ModuleAddress_1.ModuleAddress.GitHubRepo.parse(`github:${userOrOrg}/${repositoryName}`);
            })();
        }
        walk: {
            if (gitHubRepo === undefined) {
                break walk;
            }
            const getValidImportUrlFactoryResult = await exports.getValidImportUrlFactory({
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
            const getValidImportUrlFactoryResult = await exports.getValidImportUrlFactory({
                "moduleAddress": ModuleAddress_1.ModuleAddress.parse(denoPorts[nodeModuleName]),
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
exports.resolveNodeModuleToDenoModuleFactory = resolveNodeModuleToDenoModuleFactory;
/** Exported only for tests purpose */
exports.getValidImportUrlFactory = (() => {
    /**
      * Perform no check, just synchronously assemble the url
      * from a ModuleAddress, a branch and a path to file.
      * */
    function buildUrlFactory(params) {
        const { moduleAddress } = params;
        const buildUrl = (() => {
            switch (moduleAddress.type) {
                case "GITHUB REPO":
                    return (candidateBranch, pathToFile) => urlJoin_1.urlJoin("https://raw.githubusercontent.com", moduleAddress.userOrOrg, moduleAddress.repositoryName, candidateBranch, pathToFile !== null && pathToFile !== void 0 ? pathToFile : "mod.ts");
                case "DENO.LAND URL":
                    return (candidateBranch, pathToFile) => urlJoin_1.urlJoin([
                        moduleAddress.baseUrlWithoutBranch.replace(/\/$/, ""),
                        `@${candidateBranch}`
                    ].join(""), pathToFile !== null && pathToFile !== void 0 ? pathToFile : moduleAddress.pathToIndex);
                case "GITHUB-RAW URL":
                    return (candidateBranch, pathToFile) => urlJoin_1.urlJoin(moduleAddress.baseUrlWithoutBranch.replace(/\/$/, ""), candidateBranch, pathToFile !== null && pathToFile !== void 0 ? pathToFile : moduleAddress.pathToIndex);
            }
        })();
        return { buildUrl };
    }
    async function* candidateBranches(params) {
        var _a;
        const { moduleAddress } = params;
        let fallback = false;
        if (moduleAddress.type === "DENO.LAND URL" && moduleAddress.isStd) {
            yield [await getCurrentStdVersion_1.getCurrentStdVersion(), fallback];
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
            case "GITHUB REPO":
                for await (const denoModuleName of getThirdPartyDenoModuleInfos_1.thirdPartyDenoModuleNames()) {
                    const infos = (await getThirdPartyDenoModuleInfos_1.getThirdPartyDenoModuleInfos({ denoModuleName }));
                    if (infos === undefined) {
                        continue;
                    }
                    const { owner, repo, latestVersion } = infos;
                    if (!(owner === moduleAddress.userOrOrg &&
                        repo === moduleAddress.repositoryName)) {
                        continue;
                    }
                    yield [latestVersion, fallback];
                }
                yield ["deno_latest", fallback];
                yield [
                    await get_github_default_branch_name_1.getGithubDefaultBranchName({
                        "owner": moduleAddress.userOrOrg,
                        "repo": moduleAddress.repositoryName
                    }),
                    fallback
                ];
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
                        await get_github_default_branch_name_1.getGithubDefaultBranchName({
                            "owner": "denoland",
                            "repo": "deno"
                        }),
                        fallback
                    ];
                }
                else {
                    const latestVersion = (_a = (await getThirdPartyDenoModuleInfos_1.getThirdPartyDenoModuleInfos({ "denoModuleName": moduleAddress.baseUrlWithoutBranch.split("/").reverse()[0] }))) === null || _a === void 0 ? void 0 : _a.latestVersion;
                    if (latestVersion === undefined) {
                        break;
                    }
                    yield [latestVersion, fallback];
                }
                break;
        }
    }
    async function resolveVersion(params) {
        const { buildUrl } = buildUrlFactory({ "moduleAddress": params.moduleAddress });
        for await (const [candidateBranch, fallback] of candidateBranches(params)) {
            const url = buildUrl(candidateBranch);
            if (await is404_1.is404(url)) {
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
    async function isDenoified(params) {
        const { moduleAddress, branchForVersion } = params;
        const { buildUrl } = buildUrlFactory({ moduleAddress });
        let modTsRaw;
        try {
            modTsRaw = await node_fetch_1.default(buildUrl(branchForVersion))
                .then(res => res.text());
        }
        catch (_a) {
            return false;
        }
        if (!modTsRaw.match(/denoify/i)) {
            return false;
        }
        return true;
    }
    /** Asserts denoified module */
    async function getTsconfigOutDir(params) {
        const { branchForVersion, moduleAddress } = params;
        const { buildUrl } = buildUrlFactory({ moduleAddress });
        return path.normalize(commentJson.parse(await node_fetch_1.default(buildUrl(branchForVersion, "tsconfig.json")).then(res => res.text()))["compilerOptions"]["outDir"]);
    }
    ;
    const getValidImportUrlFactory = addCache_1.addCache(async (params) => {
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
        const getValidImportUrl = async (params) => {
            if (params.target === "DEFAULT EXPORT") {
                return buildUrl(branchForVersion);
            }
            const { specificImportPath } = params;
            for (const fixedTsConfigOutDir of [
                !tsconfigOutDir ? "dist" : tsconfigOutDir.replace(/\\/g, "/"),
                undefined
            ]) {
                let url = buildUrl(branchForVersion, (fixedTsConfigOutDir === undefined ?
                    specificImportPath
                    :
                        path.posix.join(path.posix.join(path.posix.dirname(fixedTsConfigOutDir), // .
                        `deno_${path.posix.basename(fixedTsConfigOutDir)}` //deno_dist
                        ), // deno_dist
                        path.posix.relative(fixedTsConfigOutDir, specificImportPath // dest/tools/typeSafety
                        ) //  tools/typeSafety
                        ) // deno_dist/tool/typeSafety
                ) + ".ts" // deno_dist/tool/typeSafety.ts
                );
                walk: {
                    if (await is404_1.is404(url)) {
                        break walk;
                    }
                    return url;
                }
                url = url
                    .replace(/\.ts$/, "/index.ts");
                walk: {
                    if (await is404_1.is404(url)) {
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
            "getValidImportUrl": addCache_1.addCache(getValidImportUrl)
        };
    });
    return { getValidImportUrlFactory };
})().getValidImportUrlFactory;
//# sourceMappingURL=resolveNodeModuleToDenoModule.js.map