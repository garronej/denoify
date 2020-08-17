import type { denoifyImportExportStatementFactory } from "./denoifyImportExportStatement";
export declare function denoifySingleFileFactory(params: {} & ReturnType<typeof denoifyImportExportStatementFactory>): {
    denoifySingleFile: (params: {
        dirPath: string;
        sourceCode: string;
    }) => Promise<string>;
};
