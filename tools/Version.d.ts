export declare type Version = {
    major: number;
    minor: number;
    patch: number;
};
export declare namespace Version {
    function parse(versionStr: string): Version;
    function stringify(v: Version): string;
    /**
     *
     * v1  <  v2  => -1
     * v1 === v2  => 0
     * v1  >  v2  => 1
     *
     */
    function compare(v1: Version, v2: Version): -1 | 0 | 1;
    function bumpType(params: {
        versionBehindStr: string;
        versionAheadStr: string;
    }): "SAME" | "MAJOR" | "MINOR" | "PATCH";
}
