import { ModuleAddress } from "../../types/ModuleAddress";
import { getValidImportUrlFactory } from "../getValidImportUrlFactory";
import { Dependencies, Result } from "../resolveNodeModuleToDenoModule";

/**
 * Creates a function that provides a URL generator for GitHub hosted modules
 */
export const githubHostedModuleUrlFinderFactory = (params: { userProvidedPorts: Dependencies; log: typeof console.log }) => {
    const { log, userProvidedPorts } = params;

    const isInUserProvidedPort = (nodeModuleName: string) => nodeModuleName in userProvidedPorts;

    return async (nodeModuleName: string, version: string, gitHubRepo?: ModuleAddress): Promise<Result | null> => {
        if (gitHubRepo === undefined) {
            return null;
        }

        const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
            "moduleAddress": gitHubRepo,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
            version
        });

        if (!getValidImportUrlFactoryResult.couldConnect) {
            return null;
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
    };
};
