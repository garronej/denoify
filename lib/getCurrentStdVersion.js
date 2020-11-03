"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentStdVersion = void 0;
const Version_1 = require("../tools/Version");
const githubTags_1 = require("../tools/githubTags");
const addCache_1 = require("../tools/addCache");
exports.getCurrentStdVersion = addCache_1.addCache(async () => {
    const stdBranch = [];
    for await (const branch of githubTags_1.listTags({
        "owner": "denoland",
        "repo": "deno"
    })) {
        const match = branch.match(/^std\/([0-9]+\.[0-9]+\.[0-9]+)$/);
        if (!match) {
            continue;
        }
        stdBranch.push(match[1]);
    }
    return Version_1.Version.stringify(stdBranch
        .map(Version_1.Version.parse)
        .sort((vX, vY) => Version_1.Version.compare(vY, vX))[0]);
});
//# sourceMappingURL=getCurrentStdVersion.js.map