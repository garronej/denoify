declare type DenoThirdPartyModuleDbEntry = {
    type: "github";
    owner: string;
    repo: string;
    desc: string;
    default_version: string;
};
declare namespace DenoThirdPartyModuleDbEntry {
    function match(entry: any): entry is DenoThirdPartyModuleDbEntry;
}
declare let database: Record<string, DenoThirdPartyModuleDbEntry> | undefined;
export declare function getDenoThirdPartyModuleDatabase(): Promise<NonNullable<typeof database>>;
export {};
