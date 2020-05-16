"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromGitignore = void 0;
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
        var e_1, _a;
        try {
            for (var fileOrDirPathsToAccept_1 = __values(fileOrDirPathsToAccept), fileOrDirPathsToAccept_1_1 = fileOrDirPathsToAccept_1.next(); !fileOrDirPathsToAccept_1_1.done; fileOrDirPathsToAccept_1_1 = fileOrDirPathsToAccept_1.next()) {
                var fileOrDirPathToAccept = fileOrDirPathsToAccept_1_1.value;
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
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (fileOrDirPathsToAccept_1_1 && !fileOrDirPathsToAccept_1_1.done && (_a = fileOrDirPathsToAccept_1.return)) _a.call(fileOrDirPathsToAccept_1);
            }
            finally { if (e_1) throw e_1.error; }
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
//# sourceMappingURL=removeFromGitignore.js.map