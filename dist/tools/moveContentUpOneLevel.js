"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const exec_1 = require("./exec");
function moveContentUpOneLevelFactory(params) {
    const { isDryRun } = params;
    const { exec } = exec_1.execFactory({ isDryRun });
    async function moveContentUpOneLevel(params) {
        const dirPath = params.dirPath.replace(/\/$/, "");
        await exec(`mv ${dirPath}/* ${dirPath}/.[^.]* ${path.join(dirPath, "..")} || true`);
        await exec(`rm -r ${dirPath}`);
    }
    return { moveContentUpOneLevel };
}
exports.moveContentUpOneLevelFactory = moveContentUpOneLevelFactory;
