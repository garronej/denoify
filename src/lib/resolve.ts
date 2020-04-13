
import * as st from "scripting-tools";
import * as path from "path";

export type DenoDependency = {
    url: string;
    main: string;
};
/** Record in package.json->deno->dependencies */
export type DenoDependencies = { [nodeModuleName: string]: DenoDependency; };

export type ResolveResult = {
    type: "PORT";
    denoDependency: DenoDependency;
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
        denoDependencies: DenoDependencies;
        /** e.g: [ "typescript", "gulp" ] */
        devDependencies: string[];
    }
) {

    const { projectPath, denoDependencies, devDependencies } = params;

    const resolve = async (
        params: { nodeModuleName: string }
    ): Promise<ResolveResult> => {

        const { nodeModuleName } = params;

        {
            const denoDependency = denoDependencies[nodeModuleName];

            if (denoDependency !== undefined) {
                return {
                    "type": "PORT",
                    denoDependency
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