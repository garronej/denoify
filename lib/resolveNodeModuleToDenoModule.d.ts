import { ModuleAddress } from "./types/ModuleAddress";
import type { getInstalledVersionPackageJsonFactory } from "./getInstalledVersionPackageJson";
declare type GetValidImportUrl = (params: {
    target: "DEFAULT EXPORT";
} | {
    target: "SPECIFIC FILE";
    specificImportPath: string;
}) => Promise<string>;
declare type Result = {
    result: "SUCCESS";
    getValidImportUrl: GetValidImportUrl;
} | {
    result: "NON-FATAL UNMET DEPENDENCY";
    kind: "DEV DEPENDENCY" | "BUILTIN";
};
export declare function resolveNodeModuleToDenoModuleFactory(params: {
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
} & ReturnType<typeof getInstalledVersionPackageJsonFactory>): {
    resolveNodeModuleToDenoModule: (params: {
        nodeModuleName: string;
    }) => Promise<Result>;
};
/** Exported only for tests purpose */
export declare const getValidImportUrlFactory: (params: ({
    moduleAddress: ModuleAddress;
} & {
    desc: "NOT LISTED AS A DEPENDENCY (PROBABLY NODE BUILTIN)";
}) | ({
    moduleAddress: ModuleAddress;
} & {
    desc: "MATCH VERSION INSTALLED IN NODE_MODULE";
    version: string;
})) => Promise<{
    couldConnect: false;
} | {
    couldConnect: true;
    versionFallbackWarning: string | undefined;
    getValidImportUrl: GetValidImportUrl;
}>;
export {};
