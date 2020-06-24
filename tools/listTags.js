"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTags = void 0;
const rest_1 = require("@octokit/rest");
async function* listTags(params) {
    const { owner, repo } = params;
    const auth = process.env["GITHUB_TOKEN"];
    const octokit = new rest_1.Octokit(auth ? { auth } : undefined);
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
exports.listTags = listTags;
//# sourceMappingURL=listTags.js.map