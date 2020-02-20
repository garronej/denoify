export declare type ModuleRepo = {
    url: string;
    main: string;
};
export declare type RepoIndex = {
    [nodeModuleName: string]: ModuleRepo;
};
export declare type GetDenoModuleRepo = (nodeModuleName: string) => Promise<ModuleRepo>;
export declare function getDenoModuleRepoFactory(params: {
    nodeModuleDirPath: string;
    repoIndex: RepoIndex;
}): {
    getDenoModuleRepo: GetDenoModuleRepo;
};
