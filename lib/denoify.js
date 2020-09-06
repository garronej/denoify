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
const resolvePathsWithWildcards_1 = require("../tools/resolvePathsWithWildcards");
const partition_1 = require("evt/tools/reducers/partition");
async function denoify(params) {
    var _a, _b, _c;
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
    const denoifyParamsFromPackageJson = (_b = packageJsonParsed["denoify"]) !== null && _b !== void 0 ? _b : {};
    {
        let { includes, ports, replacer } = denoifyParamsFromPackageJson;
        if ((includes !== undefined &&
            !includes.every(pathOrObj => typeof pathOrObj === "string" || (pathOrObj instanceof Object &&
                typeof pathOrObj.src === "string" &&
                (pathOrObj.destDir === undefined || typeof pathOrObj.destDir === "string") &&
                (pathOrObj.destBasename === undefined || typeof pathOrObj.destBasename === "string")))) || (ports !== undefined &&
            !(ports instanceof Object &&
                Object.keys(ports).every(key => typeof ports[key] === "string"))) || (replacer !== undefined &&
            typeof replacer !== "string")) {
            console.log([
                "Denoify configuration Error",
                "The \"denoify\" in the package.json is malformed",
                "See: https://github.com/garronej/my_dummy_npm_and_deno_module"
            ].join("\n"));
            process.exit(-1);
        }
    }
    const denoDistPath = path.join(path.dirname(tsconfigOutDir), `deno_${path.basename(tsconfigOutDir)}`); // ./deno_dist
    const { denoifySingleFile } = denoifySingleFile_1.denoifySingleFileFactory((() => {
        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJson_1.getInstalledVersionPackageJsonFactory({
            "projectPath": "."
        });
        const { denoifyImportExportStatement } = denoifyImportExportStatement_1.denoifyImportExportStatementFactory((() => {
            var _a, _b, _c;
            const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModule_1.resolveNodeModuleToDenoModuleFactory({
                "userProvidedPorts": (_a = denoifyParamsFromPackageJson.ports) !== null && _a !== void 0 ? _a : {},
                "dependencies": (_b = packageJsonParsed["dependencies"]) !== null && _b !== void 0 ? _b : {},
                "devDependencies": (_c = packageJsonParsed["devDependencies"]) !== null && _c !== void 0 ? _c : {},
                "log": console.log,
                getInstalledVersionPackageJson
            });
            return typeSafety_1.id({
                "getDestDirPath": ({ dirPath }) => path.join(denoDistPath, path.relative(srcDirPath, dirPath)),
                resolveNodeModuleToDenoModule,
                "userProvidedReplacerPath": denoifyParamsFromPackageJson.replacer,
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
            if (/^\s*\/\/\s*@denoify-ignore/.test(sourceCode)) {
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
    {
        const includes = ((_c = denoifyParamsFromPackageJson.includes) !== null && _c !== void 0 ? _c : ["README.md", "LICENSE"])
            .map(pathOrObj => typeof pathOrObj === "string" ?
            path.normalize(pathOrObj) :
            ({
                ...pathOrObj,
                "src": path.normalize(pathOrObj.src)
            }));
        const [strIncludes, objIncludes] = partition_1.arrPartition(includes, (include) => typeof include === "string");
        (await resolvePathsWithWildcards_1.resolvePathsWithWildcards({
            "pathWithWildcards": strIncludes
        }))
            .forEach(resolvedPath => st.fs_move("COPY", resolvedPath, path.join(denoDistPath, resolvedPath)));
        objIncludes
            .forEach(({ src, destDir, destBasename }) => st.fs_move("COPY", src, path.join(denoDistPath, path.join(destDir !== null && destDir !== void 0 ? destDir : path.dirname(src), destBasename !== null && destBasename !== void 0 ? destBasename : path.basename(src)))));
    }
}
exports.denoify = denoify;
//# sourceMappingURL=denoify.js.map