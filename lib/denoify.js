"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.denoify = void 0;
const denoifySingleFile_1 = require("./denoifySingleFile");
const transformCodebase_1 = require("./transformCodebase");
const resolve_1 = require("./resolve");
const fs = require("fs");
const path = require("path");
const commentJson = require("comment-json");
const denoifyImportArgument_1 = require("./denoifyImportArgument");
const modTsFile_1 = require("./modTsFile");
const isInsideOrIsDir_1 = require("../tools/isInsideOrIsDir");
async function denoify(params) {
    var _a;
    process.chdir((_a = params.projectPath) !== null && _a !== void 0 ? _a : ".");
    const srcDirPath = !!params.srcDirPath ?
        params.srcDirPath :
        ["src", "lib"].find(sourceDirPath => fs.existsSync(sourceDirPath));
    if (!srcDirPath) {
        throw new Error("No src directory found");
    }
    const packageJsonParsed = JSON.parse(fs.readFileSync("package.json")
        .toString("utf8"));
    const tsconfigOutDir = commentJson.parse(fs.readFileSync("./tsconfig.json")
        .toString("utf8"))["compilerOptions"]["outDir"]; // ./dist
    if (!tsconfigOutDir) {
        throw new Error("tsconfig.json must specify an outDir");
    }
    if (!isInsideOrIsDir_1.isInsideOrIsDir({
        "dirPath": tsconfigOutDir,
        "fileOrDirPath": packageJsonParsed.main
    })) {
        throw new Error(`The package.json main should point to a file inside ${tsconfigOutDir}`);
    }
    const { denoifySingleFile } = denoifySingleFile_1.denoifySingleFileFactory((() => {
        const { denoifyImportArgument } = denoifyImportArgument_1.denoifyImportArgumentFactory((() => {
            var _a, _b, _c;
            const { resolve } = resolve_1.resolveFactory({
                "projectPath": ".",
                "userProvidedPorts": (_a = packageJsonParsed["denoPorts"]) !== null && _a !== void 0 ? _a : {},
                "dependencies": (_b = packageJsonParsed["dependencies"]) !== null && _b !== void 0 ? _b : {},
                "devDependencies": (_c = packageJsonParsed["devDependencies"]) !== null && _c !== void 0 ? _c : {},
                "log": console.log
            });
            return { resolve };
        })());
        return { denoifyImportArgument };
    })());
    const denoDistPath = path.join(path.dirname(tsconfigOutDir), `deno_${path.basename(tsconfigOutDir)}`); // ./deno_dist
    await transformCodebase_1.transformCodebase({
        srcDirPath,
        "destDirPath": denoDistPath,
        "transformSourceCodeString": ({ extension, sourceCode, fileDirPath }) => /^\.?ts$/i.test(extension) || /^\.?js$/i.test(extension) ?
            denoifySingleFile({ sourceCode, fileDirPath })
            :
                Promise.resolve(sourceCode)
    });
    modTsFile_1.modTsFile.create({
        "projectPath": ".",
        "tsFilePath": path.join(denoDistPath, path.relative(tsconfigOutDir, packageJsonParsed.main // ./dist/lib/index.js
        ) // ./lib/index.js
        ) // ./deno_dist/lib/index.js
            .replace(/\.js$/i, ".ts"),
        "metadata": { srcDirPath, denoDistPath, tsconfigOutDir },
        "isDryRun": false
    });
}
exports.denoify = denoify;
//# sourceMappingURL=denoify.js.map