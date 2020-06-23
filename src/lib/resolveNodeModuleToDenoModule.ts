
import * as st from "scripting-tools";
import * as path from "path";
import * as commentJson from "comment-json";
import { getProjectRoot } from "../tools/getProjectRoot";
import * as fs from "fs";
import { ModuleAddress } from "./ModuleAddress";
import { addCache } from "../tools/addCache";

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

export type NodeToDenoModuleResolutionResult = {
    result: "SUCCESS";
    getValidImportUrl: ModuleAddress.GetValidImportUrl;
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
                ModuleAddress.getValidImportUrlFactory({
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

            const getValidImportUrlFactoryResult = await ModuleAddress.getValidImportUrlFactory({
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

            const getValidImportUrlFactoryResult = await ModuleAddress.getValidImportUrlFactory({
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

