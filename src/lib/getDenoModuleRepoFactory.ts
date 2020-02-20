
import * as st from "scripting-tools";
import * as path from "path";

export type ModuleRepo = {
    url: string;
    main: string;
};
export type RepoIndex = { [nodeModuleName: string]: ModuleRepo; };

export type GetDenoModuleRepo = (nodeModuleName: string) => Promise<ModuleRepo>;

export function getDenoModuleRepoFactory(
    params: {
        nodeModuleDirPath: string;
        repoIndex: RepoIndex;
    }
) {

    const { nodeModuleDirPath, repoIndex } = params;

    const getDenoModuleRepo: GetDenoModuleRepo = async nodeModuleName => {

        {
            const moduleRepo = repoIndex[nodeModuleName];

            if (moduleRepo !== undefined) {
                return moduleRepo;
            }

        }

        const moduleRepo: ModuleRepo | undefined = require(
            path.join(
                st.find_module_path(nodeModuleName, nodeModuleDirPath),
                "package.json"
            )
        )["deno"];

        if (moduleRepo === undefined) {

            throw new Error(`No 'deno' field in ${nodeModuleName} package.json and no entry in index`);

        }

        return moduleRepo;

    };

    return { getDenoModuleRepo };

}