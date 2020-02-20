export declare function transformCodebase(params: {
    srcDirPath: string;
    destDirPath: string;
    transformSourceCode: (params: {
        /** e.g: .ts */
        extension: string;
        sourceCode: string;
    }) => Promise<string>;
}): Promise<void>;
