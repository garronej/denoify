"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.denoify = void 0;
const denoifySingleFile_1 = require("./denoifySingleFile");
const transformCodebase_1 = require("./transformCodebase");
const resolveNodeModuleToDenoModule_1 = require("./resolveNodeModuleToDenoModule");
const fs = require("fs");
const path = require("path");
const commentJson = require("comment-json");
const denoifyImportExportStatement_1 = require("./denoifyImportExportStatement");
const isInsideOrIsDir_1 = require("../tools/isInsideOrIsDir");
const getInstalledVersionPackageJson_1 = require("./getInstalledVersionPackageJson");
const toPosix_1 = require("../tools/toPosix");
const st = require("scripting-tools");
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
    let tsconfigOutDir = commentJson.parse(fs.readFileSync("tsconfig.json")
        .toString("utf8"))["compilerOptions"]["outDir"]; // ./dist
    if (!tsconfigOutDir) {
        throw new Error("tsconfig.json must specify an outDir");
    }
    tsconfigOutDir = path.normalize(tsconfigOutDir);
    if (!("main" in packageJsonParsed)) {
        //TODO: We shouldn't force users to specify a default export.
        throw new Error([
            "A main field in package.json need to be specified",
            "otherwise we don't know what file the mod.ts should export."
        ].join(" "));
    }
    if (!isInsideOrIsDir_1.isInsideOrIsDir({
        "dirPath": tsconfigOutDir,
        "fileOrDirPath": path.normalize(packageJsonParsed["main"])
    })) {
        throw new Error(`The package.json main should point to a file inside ${tsconfigOutDir}`);
    }
    const { denoifySingleFile } = denoifySingleFile_1.denoifySingleFileFactory((() => {
        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJson_1.getInstalledVersionPackageJsonFactory({
            "projectPath": "."
        });
        const { denoifyImportExportStatement } = denoifyImportExportStatement_1.denoifyImportExportStatementFactory((() => {
            var _a, _b, _c;
            const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModule_1.resolveNodeModuleToDenoModuleFactory({
                "userProvidedPorts": (_a = packageJsonParsed["denoPorts"]) !== null && _a !== void 0 ? _a : {},
                "dependencies": (_b = packageJsonParsed["dependencies"]) !== null && _b !== void 0 ? _b : {},
                "devDependencies": (_c = packageJsonParsed["devDependencies"]) !== null && _c !== void 0 ? _c : {},
                "log": console.log,
                getInstalledVersionPackageJson
            });
            return {
                resolveNodeModuleToDenoModule,
                "userProvidedReplacerPath": packageJsonParsed["denoifyReplacer"],
                getInstalledVersionPackageJson
            };
        })());
        return { denoifyImportExportStatement };
    })());
    const denoDistPath = path.join(path.dirname(tsconfigOutDir), `deno_${path.basename(tsconfigOutDir)}`); // ./deno_dist
    await transformCodebase_1.transformCodebase({
        srcDirPath,
        "destDirPath": denoDistPath,
        "transformSourceCodeString": ({ extension, sourceCode, fileDirPath }) => /^(?:ts|tsx|js|jsx)$/i.test(extension) ?
            denoifySingleFile({ sourceCode, fileDirPath })
            :
                Promise.resolve(sourceCode)
    });
    {
        const modFilePath = path.join(denoDistPath, "mod.ts");
        if (!fs.existsSync(modFilePath)) {
            fs.writeFileSync(path.join(modFilePath), Buffer.from(`export * from "${toPosix_1.toPosix(path.relative(tsconfigOutDir, path.normalize(packageJsonParsed["main"]) // ./dist/lib/index.js
            ) // ./lib/index.js
                .replace(/\.js$/i, ".ts")).replace(/^(:?\.\/)?/, "./")}";`, "utf8"));
        }
    }
    if (fs.existsSync("README.md")) {
        st.fs_move("COPY", ".", denoDistPath, "README.md");
    }
    console.log(`Publishing on https://deno.land/x use subdirectory: ${denoDistPath} when asked`);
}
exports.denoify = denoify;
//# sourceMappingURL=denoify.js.map