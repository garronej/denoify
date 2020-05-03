"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isInsideOrIsDir_1 = require("./isInsideOrIsDir");
var fs = require("fs");
var crawl_1 = require("./crawl");
var path = require("path");
var gitignoreParser = require("gitignore-parser");
function removeFromGitignore(params) {
    var fileOrDirPathsToAccept = params.fileOrDirPathsToAccept, pathToTargetModule = params.pathToTargetModule;
    if (!fs.existsSync(path.join(pathToTargetModule, ".gitignore"))) {
        console.log("No .gitignore file");
        return { "fixedGitignoreRaw": undefined };
    }
    var gitignore = gitignoreParser.compile(fs.readFileSync(path.join(pathToTargetModule, ".gitignore"))
        .toString("utf8"));
    var fixedGitignoreRaw = crawl_1.crawl(pathToTargetModule)
        .filter(function (filePath) {
        for (var _i = 0, fileOrDirPathsToAccept_1 = fileOrDirPathsToAccept; _i < fileOrDirPathsToAccept_1.length; _i++) {
            var fileOrDirPathToAccept = fileOrDirPathsToAccept_1[_i];
            if (fs.lstatSync(fileOrDirPathToAccept).isDirectory()) {
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
        .map(function (filePath) { return "/" + filePath.replace(/^\.\//, ""); })
        .join("\n");
    //NOTE: Optimization: if node_modules is excluded do not list every files, just exclude /node_modules
    if (gitignore.denies("node_modules") &&
        !fileOrDirPathsToAccept
            .map(function (fileOrDirPath) { return isInsideOrIsDir_1.isInsideOrIsDir({ "dirPath": "node_modules", fileOrDirPath: fileOrDirPath }); }).includes(true)) {
        fixedGitignoreRaw = fixedGitignoreRaw
            .split("\n")
            .filter(function (line) { return !line.startsWith("/node_modules"); })
            .join("\n") +
            "\n/node_modules\n";
    }
    return { fixedGitignoreRaw: fixedGitignoreRaw };
}
exports.removeFromGitignore = removeFromGitignore;
