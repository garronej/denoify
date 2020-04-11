export declare type DenoDependency = {
    url: string;
    main: string;
};
export declare type DenoDependencies = {
    [nodeModuleName: string]: DenoDependency;
};
export declare function getDenoDependencyFactory(params: {
    projectPath: string;
    denoDependencies: DenoDependencies;
    devDependencies: string[];
}): {
    getDenoDependency: (nodeModuleName: string) => Promise<DenoDependency>;
};
