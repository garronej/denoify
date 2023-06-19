import { addCache } from "../../tools/addCache";
import type { getInstalledVersionPackageJsonFactory } from "../getInstalledVersionPackageJson";
import { ModuleAddress } from "../types/ModuleAddress";
import { denoPortImportFinderFactory } from "./finderFactories/denoPortImportFinderFactory";
import { dependencyImportUrlFinderFactory } from "./finderFactories/dependencyImportUrlFinderFactory";
import { githubHostedModuleUrlFinderFactory } from "./finderFactories/githubHostedModuleUrlFinderFactory";

export type GetValidImportUrl = (
    params:
        | {
              target: "DEFAULT EXPORT";
          }
        | {
              target: "SPECIFIC FILE";
              specificImportPath: string; // e.g tools/typeSafety ( no .ts ext )
          }
) => Promise<string>;

export type Result =
    | {
          result: "SUCCESS";
          getValidImportUrl: GetValidImportUrl;
      }
    | {
          result: "KNOWN BUILTIN";
          getValidImportUrl: GetValidImportUrl;
      }
    | {
          result: "UNKNOWN BUILTIN";
      };

export type Dependencies = { [nodeModuleName: string]: string };

export type FactoryParams = {
    userProvidedPorts: Dependencies;
    dependencies: Dependencies;
    devDependencies: Dependencies;
    log?: typeof console.log;
} & ReturnType<typeof getInstalledVersionPackageJsonFactory>;

export function resolveNodeModuleToDenoModuleFactory({
    getInstalledVersionPackageJson,
    userProvidedPorts,
    dependencies,
    devDependencies,
    log = console.log
}: FactoryParams) {
    const allDependencies: Dependencies = {
        ...dependencies,
        ...devDependencies
    };

    const resolveNodeModuleToDenoModule = addCache(async (params: { nodeModuleName: string }): Promise<Result> => {
        const {
            nodeModuleName //js-yaml
        } = params;

        const { findDependencyImportUrl } = dependencyImportUrlFinderFactory({
            userProvidedPorts,
            dependencies,
            devDependencies
        });
        const { findDenoPortImport } = denoPortImportFinderFactory({
            userProvidedPorts,
            log
        });
        const { findGithubHostedModuleUrl } = githubHostedModuleUrlFinderFactory({
            userProvidedPorts,
            log
        });

        const dependencyImportUrl = await findDependencyImportUrl(nodeModuleName);
        if (dependencyImportUrl !== null) {
            return dependencyImportUrl;
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
            const repositoryUrl = repositoryEntryOfPackageJson?.["url"];

            const [repositoryName, userOrOrg] =
                repositoryUrl
                    ?.replace(/\.git$/i, "")
                    .split("/")
                    .filter((s: string) => !!s)
                    .reverse() ?? [];
            if (repositoryName && userOrOrg) {
                gitHubRepo = ModuleAddress.GitHubRepo.parse(`github:${userOrOrg}/${repositoryName}`);
            }
        }

        const denoPortModule = await findDenoPortImport({ nodeModuleName, version });
        if (denoPortModule !== null) {
            return denoPortModule;
        }

        const githubHostedModule = await findGithubHostedModuleUrl({ nodeModuleName, version, gitHubRepo });
        if (githubHostedModule !== null) {
            return githubHostedModule;
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
