
import * as st from "scripting-tools";
import * as path from "path";

export type DenoDependency = {
    url: string;
    main: string;
};
export type DenoDependencies = { [nodeModuleName: string]: DenoDependency; };

export function getDenoDependencyFactory(
    params: {
        nodeModuleDirPath: string;
        denoDependencies: DenoDependencies;
    }
) {

    const { nodeModuleDirPath, denoDependencies } = params;

    const getDenoDependency= async (nodeModuleName: string): Promise<DenoDependency> => {

        {
            const moduleRepo = denoDependencies[nodeModuleName];

            if (moduleRepo !== undefined) {
                return moduleRepo;
            }

        }

        const packageJsonParsed: Record<string, any> = require(
            path.join(
                st.find_module_path(nodeModuleName, nodeModuleDirPath),
                "package.json"
            )
        );

        const denoifyKey= "deno";

        if( !(denoifyKey in packageJsonParsed) ){
            throw new Error(`No 'deno' field in ${nodeModuleName} package.json and no entry in index`);
        }

        return {
            "url": packageJsonParsed[denoifyKey].url,
            "main": packageJsonParsed[denoifyKey].main ?? 
                packageJsonParsed.main.replace(/\.js$/i, ".ts")
        };


    };

    return { getDenoDependency };

}