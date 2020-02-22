export declare type DenoDependency = {
    url: string;
    main: string;
};
export declare type DenoDependencies = {
    [nodeModuleName: string]: DenoDependency;
};
export declare function getDenoDependencyFactory(params: {
    nodeModuleDirPath: string;
    denoDependencies: DenoDependencies;
}): {
    getDenoDependency: (nodeModuleName: string) => Promise<DenoDependency>;
};
