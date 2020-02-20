declare type GetDenoModuleRepo = import("./getDenoModuleRepoFactory").GetDenoModuleRepo;
export declare function replaceImportsFactory(params: {
    getDenoModuleRepo: GetDenoModuleRepo;
}): {
    replaceImports: (params: {
        sourceCode: string;
    }) => Promise<string>;
};
export {};
