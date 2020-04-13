
import * as st from "scripting-tools";
import * as path from "path";

/** Record in package.json->deno->dependencies */
export type DependenciesPorts = { [nodeModuleName: string]: string; };

export type ResolveResult = {
    type: "PORT";
    url: string;
} | {
    type: "CROSS COMPATIBLE";
    url: string;
    tsconfigOutDir: string;
} | {
    type: "UNMET DEV DEPENDENCY";
};

export function resolveFactory(
    params: {
        projectPath: string;
        dependenciesPorts: DependenciesPorts;
        /** e.g: [ "typescript", "gulp" ] */
        devDependencies: string[];
    }
) {

    const { projectPath, dependenciesPorts, devDependencies } = params;

    const resolve = async (
        params: { nodeModuleName: string }
    ): Promise<ResolveResult> => {

        const { nodeModuleName } = params;

        {
            const url = dependenciesPorts[nodeModuleName];

            if (url !== undefined) {
                return {
                    "type": "PORT",
                    url
                }
            }

        }

        const targetModulePath = st.find_module_path(nodeModuleName, projectPath);

        const url: string | undefined = require(
            path.join(targetModulePath, "package.json")
        )?.["deno"]?.url;

        if ( url === undefined ) {

            if (devDependencies.includes(nodeModuleName)) {

                return { "type": "UNMET DEV DEPENDENCY" }

            }

            throw new Error(`No 'deno' field in ${nodeModuleName} package.json and no entry in index`);
        }

        return {
            "type": "CROSS COMPATIBLE",
            url,
            "tsconfigOutDir":
                require(path.join(projectPath, "tsconfig.json"))
                    .compilerOptions
                    .outDir
        };

    };

    return { resolve };

}