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
        {
            const upDirPath = path.join(dirPath, "..");
            await Promise.all(fs.readdirSync(dirPath).map(fileName => exec([
                "mv",
                path.join(dirPath, fileName),
                upDirPath
            ].join(" "))));
        }
        await exec(`rm -r ${dirPath}`);
    }
    return { moveContentUpOneLevel };
}
exports.moveContentUpOneLevelFactory = moveContentUpOneLevelFactory;
