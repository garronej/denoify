export declare function thirdPartyDenoModuleNames(): AsyncGenerator<string>;
export declare const getThirdPartyDenoModuleInfos: (params: {
    denoModuleName: string;
}) => Promise<{
    owner: string;
    repo: string;
    latestVersion: string;
} | undefined>;
