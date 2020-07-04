"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveNodeModuleToDenoModuleFactory = void 0;
const st = require("scripting-tools");
const path = require("path");
const commentJson = require("comment-json");
const getProjectRoot_1 = require("../tools/getProjectRoot");
const fs = require("fs");
const ModuleAddress_1 = require("./ModuleAddress");
const addCache_1 = require("../tools/addCache");
const knownPorts = (() => {
    const { third_party, builtins } = commentJson.parse(fs.readFileSync(path.join(getProjectRoot_1.getProjectRoot(), "known-ports.jsonc")).toString("utf8"));
    return {
        ...third_party,
        ...builtins
    };
})();
function resolveNodeModuleToDenoModuleFactory(params) {
    const { log } = params;
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
    const getTargetModulePath = (nodeModuleName) => st.find_module_path(nodeModuleName, params.projectPath);
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
            const getValidImportUrlFactoryResult = await ModuleAddress_1.ModuleAddress.getValidImportUrlFactory({
                "moduleAddress": ModuleAddress_1.ModuleAddress.parse(denoPorts[nodeModuleName]),
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
        repository: repositoryEntryOfPackageJson } = JSON.parse(fs.readFileSync(path.join(getTargetModulePath(nodeModuleName), // node_modules/js-yaml
        "package.json")).toString("utf8"));
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
            const getValidImportUrlFactoryResult = await ModuleAddress_1.ModuleAddress.getValidImportUrlFactory({
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
            const getValidImportUrlFactoryResult = await ModuleAddress_1.ModuleAddress.getValidImportUrlFactory({
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
//# sourceMappingURL=resolveNodeModuleToDenoModule.js.map