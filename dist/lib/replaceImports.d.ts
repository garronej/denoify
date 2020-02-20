export declare type GetDenoModuleUrlFromNodeModuleName = (moduleName: string) => Promise<{
    url: string;
    indexPath: string;
}>;
export declare function replaceImports(params: {
    sourceCode: string;
    getDenoModuleUrlFromNodeModuleName: GetDenoModuleUrlFromNodeModuleName;
}): Promise<string>;
