declare type DenoDependency = import("./getDenoDependencyFactory").DenoDependency;
export declare function denoifySourceCodeStringFactory(params: {
    getDenoDependency(nodeModuleName: string): Promise<DenoDependency>;
}): {
    denoifySourceCodeString: (params: {
        sourceCode: string;
    }) => Promise<string>;
};
export {};
