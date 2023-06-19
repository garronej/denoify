import { ModuleAddress } from "../../types/ModuleAddress";
import { getDenoPorts } from "../getDenoPorts";
import { getValidImportUrlFactory } from "../getValidImportUrlFactory";
import { Dependencies, Result } from "../resolveNodeModuleToDenoModule";

/**
 * This factory generates a function that can be used to determine the Deno import URL for a module.
 *
 * For modules defined in a project' package.json, `null` is returned
 * For node builtins, a "KNOWN BUILTIN" result is returned
 * For everything else, and attempt is made to create a function that returns a valid import URL by looking at the deno ports that have been provided by denoify and the user
 *   If one can be created, that is returned
 * Otherwise a "UNKNOWN BUILTIN" result is returned
 *
 */
export function dependencyImportUrlFinderFactory(params: {
    userProvidedPorts: Dependencies;
    dependencies: Dependencies;
    devDependencies: Dependencies;
}) {
    const denoPorts = getDenoPorts(params.userProvidedPorts);
    const packageDependencies: Dependencies = {
        ...params.dependencies,
        ...params.devDependencies
    };

    async function findDependencyImportUrl(nodeModuleName: string): Promise<Result | null> {
        if (nodeModuleName in packageDependencies) {
            return null;
        }

        if (Object.values(denoPorts).includes(nodeModuleName)) {
            return { "result": "KNOWN BUILTIN", getValidImportUrl: () => Promise.resolve("") };
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

    return { findDependencyImportUrl };
}
