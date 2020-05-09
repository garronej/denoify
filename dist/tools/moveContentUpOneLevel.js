"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const exec_1 = require("./exec");
const fs = require("fs");
function moveContentUpOneLevelFactory(params) {
    const { isDryRun } = params;
    const { exec } = exec_1.execFactory({ isDryRun });
    async function moveContentUpOneLevel(params) {
        const dirPath = params.dirPath.replace(/\/$/, "");
        await exec(`mv ${dirPath}/* ${dirPath}/.[^.]* ${path.join(dirPath, "..")} || true`);
        for (const file_name of fs.readdirSync(dirPath)) {
            const file_path = path.join(dirPath, file_name);
            await exec([
                "mv",
                ...(fs.lstatSync(file_path).isDirectory() ? ["-r"] : []),
                file_path,
                "."
            ].join(" "));
        }
        await exec(`rm -r ${dirPath}`);
    }
    return { moveContentUpOneLevel };
}
exports.moveContentUpOneLevelFactory = moveContentUpOneLevelFactory;
