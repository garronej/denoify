"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isInsideOrIsDir_1 = require("./isInsideOrIsDir");
const fs = require("fs");
const crawl_1 = require("./crawl");
const path = require("path");
const gitignoreParser = require("gitignore-parser");
function removeFromGitignore(params) {
    const { fileOrDirPathsToAccept, pathToTargetModule } = params;
    if (!fs.existsSync(path.join(pathToTargetModule, ".gitignore"))) {
        console.log("No .gitignore file");
        return { "fixedGitignoreRaw": undefined };
    }
    const gitignore = gitignoreParser.compile(fs.readFileSync(path.join(pathToTargetModule, ".gitignore"))
        .toString("utf8"));
    let fixedGitignoreRaw = crawl_1.crawl(pathToTargetModule)
        .filter(filePath => {
        for (const fileOrDirPathToAccept of fileOrDirPathsToAccept) {
            if (fs.existsSync(fileOrDirPathToAccept) ?
                fs.lstatSync(fileOrDirPathToAccept).isDirectory()
                :
                    (fileOrDirPathToAccept.endsWith("/") ||
                        !fileOrDirPathToAccept.match(/\.[^\.]{1,6}$/))) {
                if (isInsideOrIsDir_1.isInsideOrIsDir({
                    "dirPath": fileOrDirPathToAccept,
                    "fileOrDirPath": filePath
                })) {
                    return false;
                }
            }
            if (path.relative(fileOrDirPathToAccept, filePath) === "") {
                return false;
            }
        }
        return gitignore.denies(filePath);
    })
        .map(filePath => "/" + filePath.replace(/^\.\//, ""))
        .join("\n");
    //NOTE: Optimization: if node_modules is excluded do not list every files, just exclude /node_modules
    if (gitignore.denies("node_modules") &&
        !fileOrDirPathsToAccept
            .map(fileOrDirPath => isInsideOrIsDir_1.isInsideOrIsDir({ "dirPath": "node_modules", fileOrDirPath })).includes(true)) {
        fixedGitignoreRaw = fixedGitignoreRaw
            .split("\n")
            .filter(line => !line.startsWith("/node_modules"))
            .join("\n") +
            "\n/node_modules\n";
    }
    return { fixedGitignoreRaw };
}
exports.removeFromGitignore = removeFromGitignore;
