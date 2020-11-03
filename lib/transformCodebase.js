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
        const filePath = path.join(srcDirPath, file_relative_path);
        const transformSourceCodeStringResult = await transformSourceCodeString({
            "sourceCode": fs.readFileSync(filePath).toString("utf8"),
            "filePath": path.join(srcDirPath, file_relative_path)
        });
        if (transformSourceCodeStringResult === undefined) {
            continue;
        }
        await createDirectoryIfNotExistsRecursive_1.createDirectoryIfNotExistsRecursive(path.dirname(path.join(destDirPath, file_relative_path)));
        const { newFileName, modifiedSourceCode } = transformSourceCodeStringResult;
        fs.writeFileSync(path.join(path.dirname(path.join(destDirPath, file_relative_path)), newFileName !== null && newFileName !== void 0 ? newFileName : path.basename(file_relative_path)), Buffer.from(modifiedSourceCode, "utf8"));
    }
}
exports.transformCodebase = transformCodebase;
//# sourceMappingURL=transformCodebase.js.map