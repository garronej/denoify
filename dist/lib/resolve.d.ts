/** Record in package.json->deno->dependencies */
export declare type DependenciesPorts = {
    [nodeModuleName: string]: string;
};
export declare type ResolveResult = {
    type: "PORT";
    url: string;
} | {
    type: "CROSS COMPATIBLE";
    url: string;
    tsconfigOutDir: string;
} | {
    type: "UNMET";
    kind: "DEV DEPENDENCY" | "STANDARD";
};
export declare function resolveFactory(params: {
    projectPath: string;
    dependenciesPorts: DependenciesPorts;
    /** e.g: [ "typescript", "gulp" ] */
    devDependencies: string[];
}): {
    resolve: (params: {
        nodeModuleName: string;
    }) => Promise<ResolveResult>;
};
