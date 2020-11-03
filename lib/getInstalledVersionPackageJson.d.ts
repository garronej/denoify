export declare function getInstalledVersionPackageJsonFactory(params: {
    projectPath: string;
}): {
    getInstalledVersionPackageJson: (params: {
        nodeModuleName: string;
    }) => Promise<{
        version: string;
        repository?: {
            url: string;
        };
    }>;
};
