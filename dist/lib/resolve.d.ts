export declare type ResolveResult = {
    type: "PORT";
    url: string;
} | {
    type: "CROSS COMPATIBLE";
    baseUrl: string;
    tsconfigOutDir: string;
} | {
    type: "UNMET";
    kind: "DEV DEPENDENCY" | "STANDARD";
};
export declare function resolveFactory(params: {
    projectPath: string;
    denoPorts: {
        [nodeModuleName: string]: string;
    };
    devDependencies: {
        [nodeModuleName: string]: string;
    };
    dependencies: {
        [nodeModuleName: string]: string;
    };
}): {
    resolve: (params: {
        nodeModuleName: string;
    }) => Promise<ResolveResult>;
};
