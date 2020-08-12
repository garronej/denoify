export declare function execFactory(params: {
    isDryRun: boolean;
}): {
    exec: (cmd: string) => Promise<void>;
};
