"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fsCopy = void 0;
const fs = require("fs");
const path = require("path");
const crawl_1 = require("./crawl");
/** Copy file or directory. Works on windows.
 * Non exsisting directories are created recursively
 */
exports.fsCopy = (src, dest) => {
    if (!fs.lstatSync(src).isDirectory()) {
        fs.mkdirSync(path.dirname(dest), { "recursive": true });
        fs.copyFileSync(src, dest);
        return;
    }
    crawl_1.crawl(src).forEach(relativeFilePath => {
        fs.mkdirSync(dest, { "recursive": true });
        fs.copyFileSync(path.join(src, relativeFilePath), path.join(dest, relativeFilePath));
    });
};
//# sourceMappingURL=fsCopy.js.map