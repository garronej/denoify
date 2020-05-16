"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectRoot = void 0;
var fs = require("fs");
var path = require("path");
function getProjectRootRec(dirPath) {
    if (fs.existsSync(path.join(dirPath, "package.json"))) {
        return dirPath;
    }
    return getProjectRootRec(path.join(dirPath, ".."));
}
var result = undefined;
function getProjectRoot() {
    if (result !== undefined) {
        return result;
    }
    return result = getProjectRootRec(__dirname);
}
exports.getProjectRoot = getProjectRoot;
//# sourceMappingURL=getProjectRoot.js.map