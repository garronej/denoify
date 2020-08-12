export declare function listTags(params: {
    owner: string;
    repo: string;
}): AsyncGenerator<string>;
/** Returns the same "latest" tag as deno.land/x, not actually the latest though */
export declare function getLatestTag(params: {
    owner: string;
    repo: string;
}): Promise<string | undefined>;
