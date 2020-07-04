import { ModuleAddress } from "./ModuleAddress";
export declare type NodeToDenoModuleResolutionResult = {
    result: "SUCCESS";
    getValidImportUrl: ModuleAddress.GetValidImportUrl;
} | {
    result: "NON-FATAL UNMET DEPENDENCY";
    kind: "DEV DEPENDENCY" | "BUILTIN";
};
export declare function resolveNodeModuleToDenoModuleFactory(params: {
    projectPath: string;
    userProvidedPorts: {
        [nodeModuleName: string]: string;
    };
    dependencies: {
        [nodeModuleName: string]: string;
    };
    devDependencies: {
        [nodeModuleName: string]: string;
    };
    log: typeof console.log;
}): {
    resolveNodeModuleToDenoModule: (params: {
        nodeModuleName: string;
    }) => Promise<NodeToDenoModuleResolutionResult>;
};
