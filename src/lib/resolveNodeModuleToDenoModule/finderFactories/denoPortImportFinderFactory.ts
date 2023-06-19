import { ModuleAddress } from "../../types/ModuleAddress";
import { getDenoPorts } from "../getDenoPorts";
import { getValidImportUrlFactory } from "../getValidImportUrlFactory";
import { Dependencies, Result } from "../resolveNodeModuleToDenoModule";

/**
 * This factory creates a function that tries to generate a valid URL to a Deno port
 */
export function denoPortImportFinderFactory(params: { userProvidedPorts: Dependencies; log: typeof console.log }) {
    const denoPorts = getDenoPorts(params.userProvidedPorts);
    const { log } = params;

    async function findDenoPortImport({ nodeModuleName, version }: { nodeModuleName: string; version: string }): Promise<Result | null> {
        if (!(nodeModuleName in denoPorts)) {
            return null;
        }

        const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
            "moduleAddress": ModuleAddress.parse(denoPorts[nodeModuleName]),
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
            version
        });

        if (!getValidImportUrlFactoryResult.couldConnect) {
            log([`WARNING: Even if the port ${denoPorts[nodeModuleName]}`, `was specified for ${nodeModuleName} we couldn't connect to the repo`]);
            return null;
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

    return { findDenoPortImport };
}
