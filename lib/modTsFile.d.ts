export declare namespace modTsFile {
    type Metadata = {
        srcDirPath: string;
        denoDistPath: string;
        tsconfigOutDir: string;
    };
    /** create [projectPath]/mod.ts file */
    function create(params: {
        projectPath: string;
        tsFilePath: string;
        metadata?: Metadata;
        isDryRun: boolean;
    }): void;
    /** Assert has been created with metadata */
    function parseMetadata(params: {
        projectPath: string;
    }): Metadata;
}
