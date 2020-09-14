export declare function moveContentUpOneLevelFactory(params: {
    isDryRun: boolean;
}): {
    moveContentUpOneLevel: (params: {
        dirPath: string;
    }) => Promise<{
        beforeMovedFilePaths: string[];
    }>;
};
