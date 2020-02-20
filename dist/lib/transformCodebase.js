"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function transformCodebase(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { srcDirPath, destDirPath, transformSourceCode } = params;
        for (const file_relative_path of crawl(srcDirPath)) {
            st.fs_move("COPY", srcDirPath, destDirPath, file_relative_path);
            const file_path = path.join(destDirPath, file_relative_path);
            fs.writeFileSync(file_path, Buffer.from(yield transformSourceCode({
                "extension": path.extname(file_path).substr(1).toLowerCase(),
                "sourceCode": fs.readFileSync(file_path).toString("utf8")
            }), "utf8"));
        }
    });
}
exports.transformCodebase = transformCodebase;
