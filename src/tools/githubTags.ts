import { Octokit } from "@octokit/rest";
import { addCache } from "../tools/addCache";

let octokit: Octokit | undefined = undefined;

const octokit_repos_listTags = addCache(async (params: { owner: string; repo: string; per_page: number; page: number }) => {
    if (octokit === undefined) {
        const auth = process.env["GITHUB_TOKEN"];

        octokit = new Octokit(auth ? { auth } : undefined);
    }

    return octokit.repos.listTags(params);
});

const per_page = 99;

export async function* listTags(params: { owner: string; repo: string }): AsyncGenerator<string> {
    const { owner, repo } = params;

    let page = 1;

    while (true) {
        const resp = await octokit_repos_listTags({
            owner,
            repo,
            per_page,
            "page": page++
        });

        for (const branch of resp.data.map(({ name }) => name)) {
            yield branch;
        }

        if (resp.data.length < 99) {
            break;
        }
    }
}

/** Returns the same "latest" tag as deno.land/x, not actually the latest though */
export async function getLatestTag(params: { owner: string; repo: string }): Promise<string | undefined> {
    const { owner, repo } = params;

    const itRes = await listTags({ owner, repo }).next();

    if (itRes.done) {
        return undefined;
    }

    return itRes.value;
}
