export declare type DenoDependency = {
    url: string;
    main: string;
};
/** Record in package.json->deno->dependencies */
export declare type DenoDependencies = {
    [nodeModuleName: string]: DenoDependency;
};
export declare type ResolveResult = {
    type: "PORT";
    denoDependency: DenoDependency;
} | {
    type: "CROSS COMPATIBLE";
    url: string;
    tsconfigOutDir: string;
} | {
    type: "UNMET DEV DEPENDENCY";
};
export declare function resolveFactory(params: {
    projectPath: string;
    denoDependencies: DenoDependencies;
    /** e.g: [ "typescript", "gulp" ] */
    devDependencies: string[];
}): {
    resolve: (params: {
        nodeModuleName: string;
    }) => Promise<ResolveResult>;
};
