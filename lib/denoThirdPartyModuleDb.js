"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDenoThirdPartyModuleDatabase = void 0;
const node_fetch_1 = require("node-fetch");
const urlJoin_1 = require("../tools/urlJoin");
const get_github_default_branch_name_1 = require("get-github-default-branch-name");
var DenoThirdPartyModuleDbEntry;
(function (DenoThirdPartyModuleDbEntry) {
    function match(entry) {
        return (entry instanceof Object &&
            entry.type === "github" &&
            typeof entry.owner === "string" &&
            typeof entry.repo === "string" &&
            typeof entry.desc === "string" &&
            typeof entry.default_version === "string");
    }
    DenoThirdPartyModuleDbEntry.match = match;
})(DenoThirdPartyModuleDbEntry || (DenoThirdPartyModuleDbEntry = {}));
let database = undefined;
async function getDenoThirdPartyModuleDatabase() {
    if (database === undefined) {
        const owner = "denoland";
        const repo = "deno_website2";
        const unfilteredDatabase = JSON.parse(await node_fetch_1.default(urlJoin_1.urlJoin("https://raw.githubusercontent.com", owner, repo, await get_github_default_branch_name_1.getGithubDefaultBranchName({ owner, repo }), "database.json"))
            .then(res => res.text()));
        database = {};
        for (const moduleName in unfilteredDatabase) {
            const entry = unfilteredDatabase[moduleName];
            if (!DenoThirdPartyModuleDbEntry.match(entry)) {
                continue;
            }
            database[moduleName] = entry;
        }
    }
    return database;
}
exports.getDenoThirdPartyModuleDatabase = getDenoThirdPartyModuleDatabase;
//# sourceMappingURL=denoThirdPartyModuleDb.js.map