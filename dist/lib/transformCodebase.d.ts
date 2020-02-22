/** Apply a transformation function to every file of directory */
export declare function transformCodebase(params: {
    srcDirPath: string;
    destDirPath: string;
    transformSourceCodeString: (params: {
        /** e.g: .ts */
        extension: string;
        sourceCode: string;
    }) => Promise<string>;
}): Promise<void>;
