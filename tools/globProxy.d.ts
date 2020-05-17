export declare function globProxyFactory(params: {
    cwdAndRood: string;
}): {
    globProxy: (params: {
        pathWithWildcard: string;
    }) => Promise<string[]>;
};
