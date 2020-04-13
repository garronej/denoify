"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const st = require("scripting-tools");
const fs = require("fs");
const path = require("path");
/** List all files in a given directory return paths relative to the dir_path */
const crawl = (() => {
    const crawlRec = (dir_path, paths) => {
        for (const file_name of fs.readdirSync(dir_path)) {
            const file_path = path.join(dir_path, file_name);
            const ls_stat = fs.lstatSync(file_path);
            if (ls_stat.isDirectory()) {
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
/** Apply a transformation function to every file of directory */
async function transformCodebase(params) {
    const { srcDirPath, destDirPath, transformSourceCodeString } = params;
    for (const file_relative_path of crawl(srcDirPath)) {
        st.fs_move("COPY", srcDirPath, destDirPath, file_relative_path);
        const file_path = path.join(destDirPath, file_relative_path);
        fs.writeFileSync(file_path, Buffer.from(await transformSourceCodeString({
            "extension": path.extname(file_path).substr(1).toLowerCase(),
            "sourceCode": fs.readFileSync(file_path).toString("utf8"),
            "fileDirPath": path.dirname(path.join(srcDirPath, file_relative_path))
        }), "utf8"));
    }
}
exports.transformCodebase = transformCodebase;
