"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawl = void 0;
const fs = require("fs");
const path = require("path");
/** List all files in a given directory return paths relative to the dir_path */
exports.crawl = (() => {
    const crawlRec = (dir_path, paths) => {
        for (const file_name of fs.readdirSync(dir_path)) {
            const file_path = path.join(dir_path, file_name);
            if (fs.lstatSync(file_path).isDirectory()) {
                crawlRec(file_path, paths);
                continue;
            }
            paths.push(file_path);
        }
    };
    return function crawl(dir_path) {
        const paths = [];
        crawlRec(dir_path, paths);
        return paths.map(file_path => path.relative(dir_path, file_path));
    };
})();
//# sourceMappingURL=crawl.js.map