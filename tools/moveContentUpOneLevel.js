"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveContentUpOneLevelFactory = void 0;
const path = require("path");
const exec_1 = require("./exec");
const st = require("scripting-tools");
const crawl_1 = require("./crawl");
function moveContentUpOneLevelFactory(params) {
    const { isDryRun } = params;
    const { exec } = exec_1.execFactory({ isDryRun });
    async function moveContentUpOneLevel(params) {
        const dirPath = params.dirPath.replace(/\/$/, "");
        const upDirPath = path.join(dirPath, "..");
        const beforeMovedFilePaths = crawl_1.crawl(dirPath);
        for (const beforeMovedFilePath of beforeMovedFilePaths) {
            console.log([
                `${isDryRun ? "(dry) " : ""}Moving`,
                path.join(dirPath, beforeMovedFilePath),
                `to ${path.join(upDirPath, beforeMovedFilePath)}`
            ].join(" "));
            walk: {
                if (isDryRun) {
                    break walk;
                }
                st.fs_move("MOVE", dirPath, upDirPath, beforeMovedFilePath);
            }
        }
        await exec(`rm -r ${dirPath}`);
        return { beforeMovedFilePaths };
    }
    return { moveContentUpOneLevel };
}
exports.moveContentUpOneLevelFactory = moveContentUpOneLevelFactory;
//# sourceMappingURL=moveContentUpOneLevel.js.map