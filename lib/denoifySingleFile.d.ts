import type { denoifyImportArgumentFactory } from "./denoifyImportArgument";
export declare function denoifySingleFileFactory(params: {
    denoifyImportArgument: ReturnType<typeof denoifyImportArgumentFactory>["denoifyImportArgument"];
}): {
    denoifySingleFile: (params: {
        fileDirPath: string;
        sourceCode: string;
    }) => Promise<string>;
};
