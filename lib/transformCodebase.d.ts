/** Apply a transformation function to every file of directory */
export declare function transformCodebase(params: {
    srcDirPath: string;
    destDirPath: string;
    transformSourceCodeString: (params: {
        sourceCode: string;
        filePath: string;
    }) => Promise<{
        modifiedSourceCode: string;
        newFileName?: string;
    } | undefined>;
}): Promise<void>;
