export declare function globProxyFactory(params: {
    cwdAndRoot: string;
}): {
    globProxy: (params: {
        pathWithWildcard: string;
    }) => Promise<string[]>;
};
