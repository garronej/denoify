import type { Result as ResolveResult } from "./resolve";
export declare function denoifySourceCodeStringFactory(params: {
    resolve(params: {
        nodeModuleName: string;
    }): Promise<ResolveResult>;
}): {
    denoifySourceCodeString: (params: {
        fileDirPath: string;
        sourceCode: string;
    }) => Promise<string>;
};
