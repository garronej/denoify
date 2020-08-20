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
const typeSafety_1 = require("evt/tools/typeSafety");
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
    const { tsconfigOutDir } = (() => {
        const parsedTsCompile = commentJson.parse(fs.readFileSync("tsconfig.json")
            .toString("utf8"));
        const { outDir } = parsedTsCompile["compilerOptions"];
        if (!outDir) {
            throw new Error("tsconfig.json must specify an outDir");
        }
        return {
            "tsconfigOutDir": path.normalize(outDir) // dist/
        };
    })();
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
    const denoDistPath = path.join(path.dirname(tsconfigOutDir), `deno_${path.basename(tsconfigOutDir)}`); // ./deno_dist
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
            return typeSafety_1.id({
                "getDestDirPath": ({ dirPath }) => path.join(denoDistPath, path.relative(srcDirPath, dirPath)),
                resolveNodeModuleToDenoModule,
                "userProvidedReplacerPath": packageJsonParsed["denoifyReplacer"],
                getInstalledVersionPackageJson
            });
        })());
        return { denoifyImportExportStatement };
    })());
    await transformCodebase_1.transformCodebase({
        srcDirPath,
        "destDirPath": denoDistPath,
        "transformSourceCodeString": async ({ sourceCode, filePath }) => {
            if (/\.deno\.tsx?$/i.test(filePath)) {
                const nodeFilePath = filePath.replace(/\.deno\.ts/i, ".ts");
                if (fs.existsSync(nodeFilePath)) {
                    return undefined;
                }
                return {
                    "modifiedSourceCode": sourceCode,
                    "newFileName": path.basename(nodeFilePath)
                };
            }
            if (!/\.(?:ts|tsx|js|jsx)$/i.test(filePath)) {
                return { "modifiedSourceCode": sourceCode };
            }
            const denoVersionFilePath = (() => {
                const split = filePath.split(".");
                split.splice(split.length - 1, 0, "deno");
                return split.join(".");
            })();
            if (fs.existsSync(denoVersionFilePath)) {
                return {
                    "modifiedSourceCode": fs.readFileSync(denoVersionFilePath)
                        .toString("utf8")
                };
            }
            if (sourceCode.replace(/^\s*/, "")
                .startsWith("//@denoify-ignore")) {
                return undefined;
            }
            return {
                "modifiedSourceCode": await denoifySingleFile({
                    sourceCode,
                    "dirPath": path.dirname(filePath)
                })
            };
        }
    });
    {
        const modFilePath = path.join(denoDistPath, "mod.ts");
        if (!fs.existsSync(modFilePath)) {
            fs.writeFileSync(path.join(modFilePath), Buffer.from(`export * from "${toPosix_1.toPosix(path.relative(tsconfigOutDir, path.normalize(packageJsonParsed["main"]) // ./dist/lib/index.js
            ) // ./lib/index.js
                .replace(/\.js$/i, ".ts")).replace(/^(:?\.\/)?/, "./")}";`, "utf8"));
        }
    }
    for (const fileName of ["README.md", "LICENSE"]) {
        if (!fs.existsSync(fileName)) {
            continue;
        }
        st.fs_move("COPY", ".", denoDistPath, fileName);
    }
}
exports.denoify = denoify;
//# sourceMappingURL=denoify.js.map