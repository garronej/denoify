"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInsideOrIsDir = void 0;
const path = require("path");
function isInsideOrIsDir(params) {
    const { dirPath, fileOrDirPath } = params;
    const relative = path.relative(dirPath, fileOrDirPath);
    if (relative === "") {
        return true;
    }
    return !relative.startsWith("..");
}
exports.isInsideOrIsDir = isInsideOrIsDir;
//# sourceMappingURL=isInsideOrIsDir.js.map