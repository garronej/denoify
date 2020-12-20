export declare const getThirdPartyDenoModuleInfos: (params: {
    denoModuleName: string;
}) => Promise<{
    owner: string;
    repo: string;
    latestVersion: string;
    subdir: string;
} | undefined>;
