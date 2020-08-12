import type { denoifyImportExportStatementFactory } from "./denoifyImportExportStatement";
export declare function denoifySingleFileFactory(params: {} & ReturnType<typeof denoifyImportExportStatementFactory>): {
    denoifySingleFile: (params: {
        fileDirPath: string;
        sourceCode: string;
    }) => Promise<string>;
};
