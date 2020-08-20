"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestTag = exports.listTags = void 0;
const rest_1 = require("@octokit/rest");
const addCache_1 = require("../tools/addCache");
let octokit = undefined;
const octokit_repos_listTags = addCache_1.addCache(async (params) => {
    if (octokit === undefined) {
        const auth = process.env["GITHUB_TOKEN"];
        octokit = new rest_1.Octokit(auth ? { auth } : undefined);
    }
    return octokit.repos.listTags(params);
});
const per_page = 99;
async function* listTags(params) {
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
exports.listTags = listTags;
/** Returns the same "latest" tag as deno.land/x, not actually the latest though */
async function getLatestTag(params) {
    const { owner, repo } = params;
    const itRes = await listTags({ owner, repo }).next();
    if (itRes.done) {
        return undefined;
    }
    return itRes.value;
}
exports.getLatestTag = getLatestTag;
//# sourceMappingURL=githubTags.js.map