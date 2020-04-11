import type { DenoDependency } from "./getDenoDependencyFactory";
export declare function denoifySourceCodeStringFactory(params: {
    getDenoDependency(nodeModuleName: string): Promise<DenoDependency>;
}): {
    denoifySourceCodeString: (params: {
        sourceCode: string;
    }) => Promise<string>;
};
