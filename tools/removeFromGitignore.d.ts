export declare function removeFromGitignore(params: {
    pathToTargetModule: string;
    fileOrDirPathsToAccept: string[];
}): {
    fixedGitignoreRaw: string | undefined;
};
