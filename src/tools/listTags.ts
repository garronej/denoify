
import { Octokit } from "@octokit/rest";

export async function* listTags(
    params: {
        owner: string;
        repo: string;
    }
): AsyncGenerator<string> {

    const { owner, repo } = params;

    const auth = process.env["GITHUB_TOKEN"];

    const octokit = new Octokit(auth ? { auth } : undefined);

    const per_page = 99;

    let page = 1;

    while (true) {

        const resp = await octokit.repos.listTags({
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





