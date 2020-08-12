"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformCodebase = void 0;
const fs = require("fs");
const path = require("path");
const crawl_1 = require("../tools/crawl");
const createDirectoryIfNotExistsRecursive_1 = require("../tools/createDirectoryIfNotExistsRecursive");
/** Apply a transformation function to every file of directory */
async function transformCodebase(params) {
    const { srcDirPath, destDirPath, transformSourceCodeString } = params;
    for (const file_relative_path of crawl_1.crawl(srcDirPath)) {
        {
            const [src, dest] = [srcDirPath, destDirPath]
                .map(base => path.join(base, file_relative_path));
            //fs.mkdirSync(path.dirname(dest), { "recursive": true });
            await createDirectoryIfNotExistsRecursive_1.createDirectoryIfNotExistsRecursive(path.dirname(dest));
            fs.copyFileSync(src, dest);
        }
        const file_path = path.join(destDirPath, file_relative_path);
        fs.writeFileSync(file_path, Buffer.from(await transformSourceCodeString({
            "extension": path.extname(file_path).substr(1).toLowerCase(),
            "sourceCode": fs.readFileSync(file_path).toString("utf8"),
            "fileDirPath": path.dirname(path.join(srcDirPath, file_relative_path))
        }), "utf8"));
    }
}
exports.transformCodebase = transformCodebase;
//# sourceMappingURL=transformCodebase.js.map