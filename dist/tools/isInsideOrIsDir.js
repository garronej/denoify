"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
function isInsideOrIsDir(params) {
    var dirPath = params.dirPath, fileOrDirPath = params.fileOrDirPath;
    var relative = path.relative(dirPath, fileOrDirPath);
    if (relative === "") {
        return true;
    }
    return !relative.startsWith("..");
}
exports.isInsideOrIsDir = isInsideOrIsDir;
