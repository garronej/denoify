#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const globProxy_1 = require("../tools/globProxy");
const modTsFile_1 = require("../lib/modTsFile");
const pathDepth_1 = require("../tools/pathDepth");
const moveContentUpOneLevel_1 = require("../tools/moveContentUpOneLevel");
const exec_1 = require("../tools/exec");
const getIsDryRun_1 = require("../lib/getIsDryRun");
const crawl_1 = require("../tools/crawl");
const fs = require("fs");
const commentJson = require("comment-json");
/**
 * To disable dry run mode  DRY_RUN=1 env variable must be set.
 * This function Change change the working directory.
 * */
async function run(params) {
    var _a;
    const { isDryRun } = params;
    const { exec } = exec_1.execFactory({ isDryRun });
    const { moveContentUpOneLevel } = moveContentUpOneLevel_1.moveContentUpOneLevelFactory({ isDryRun });
    process.chdir(params.pathToTargetModule);
    if (fs.existsSync(".npmignore")) {
        throw new Error(".npmignore not supported, please use package.json 'files' instead");
    }
    const packageJsonRaw = fs.readFileSync("package.json")
        .toString("utf8");
    const packageJsonParsed = JSON.parse(packageJsonRaw);
    const packageJsonFilesResolved = await (() => {
        const pathWithWildcards = packageJsonParsed
            .files;
        if (!pathWithWildcards) {
            return undefined;
        }
        const { globProxy } = globProxy_1.globProxyFactory({ "cwdAndRood": "." });
        const flat = [
            (prev, curr) => [...prev, ...curr],
            []
        ];
        return Promise.all(pathWithWildcards
            .map(pathWithWildcard => globProxy({ pathWithWildcard }))).then(arrOfArr => arrOfArr
            .reduce(...flat)
            .map(fileOrDirPath => !fs.lstatSync(fileOrDirPath).isDirectory() ?
            [fileOrDirPath]
            :
                crawl_1.crawl(fileOrDirPath)
                    .map(filePath => path.join(fileOrDirPath, filePath)))
            .reduce(...flat));
    })();
    const { srcDirPath, denoDistPath, tsconfigOutDir } = fs.existsSync("./mod.ts") ?
        modTsFile_1.modTsFile.parseMetadata({ "projectPath": "." })
        :
            {
                "srcDirPath": "./src",
                "denoDistPath": undefined,
                "tsconfigOutDir": commentJson.parse(fs.readFileSync("./tsconfig.json")
                    .toString("utf8"))["compilerOptions"]["outDir"]
            };
    if (pathDepth_1.pathDepth(tsconfigOutDir) != 1) {
        throw new Error("For this script to work tsconfig out dir must be a directory at the root of the project");
    }
    if (!!denoDistPath) {
        await exec(`rm -r ${denoDistPath}`);
    }
    const moveSourceFiles = "types" in packageJsonParsed ?
        !packageJsonParsed["types"].match(/\.d\.ts$/i)
        :
            false;
    console.log(moveSourceFiles ?
        "Putting .ts files alongside .js files" :
        "Leaving .ts file in the src/ directory");
    const beforeMovedFilePaths = await (async () => {
        const moveAndReplace = (dirPath) => moveContentUpOneLevel({ dirPath })
            .then(({ beforeMovedFilePaths }) => beforeMovedFilePaths.map(filePath => path.join(dirPath, filePath)));
        return [
            ...(await moveAndReplace(tsconfigOutDir)),
            ...(moveSourceFiles ? await moveAndReplace(srcDirPath) : [])
        ];
    })();
    const getAfterMovedFilePath = (params) => {
        const beforeMovedFilePath = beforeMovedFilePaths.find(beforeMovedFilePath => path.relative(beforeMovedFilePath, params.beforeMovedFilePath) === "");
        if (beforeMovedFilePath === undefined) {
            //NOTE: In case the path would be absolute.
            return path.relative(".", params.beforeMovedFilePath);
        }
        const afterMovedFilePath = beforeMovedFilePath
            .replace(/^\.\//, "")
            .split(path.sep)
            .filter((...[, index]) => index !== 0)
            .join(path.sep);
        return afterMovedFilePath;
    };
    beforeMovedFilePaths
        .filter(beforeMovedFilePath => /\.js\.map$/.test(beforeMovedFilePath))
        .forEach(beforeMovedSourceMapFilePath => {
        const afterMovedSourceMapFilePath = getAfterMovedFilePath({
            "beforeMovedFilePath": beforeMovedSourceMapFilePath
        });
        const sourceMapParsed = JSON.parse(fs.readFileSync(isDryRun ?
            beforeMovedSourceMapFilePath :
            afterMovedSourceMapFilePath).toString("utf8"));
        const sources = sourceMapParsed.sources
            .map(filePath => path.relative(path.dirname(afterMovedSourceMapFilePath), getAfterMovedFilePath({
            "beforeMovedFilePath": path.join(path.dirname(beforeMovedSourceMapFilePath), filePath)
        })));
        console.log([
            `${isDryRun ? "(dry) " : ""}Editing ${path.basename(beforeMovedSourceMapFilePath)}:`,
            JSON.stringify({ "sources": sourceMapParsed.sources }),
            `-> ${JSON.stringify({ sources })}`
        ].join(" "));
        walk: {
            if (isDryRun) {
                break walk;
            }
            fs.writeFileSync(afterMovedSourceMapFilePath, Buffer.from(JSON.stringify({
                ...sourceMapParsed,
                sources
            }), "utf8"));
        }
    });
    walk: {
        const newPackageJsonRaw = JSON.stringify({
            ...packageJsonParsed,
            ...("main" in packageJsonParsed ? {
                "main": getAfterMovedFilePath({
                    "beforeMovedFilePath": packageJsonParsed["main"]
                })
            } : {}),
            ...("types" in packageJsonParsed ? {
                "types": getAfterMovedFilePath({
                    "beforeMovedFilePath": packageJsonParsed["types"]
                })
            } : {}),
            ...("bin" in packageJsonParsed ? {
                "bin": (() => {
                    const out = {};
                    Object.keys(packageJsonParsed.bin)
                        .map(binName => [binName, packageJsonParsed.bin[binName]])
                        .forEach(([binName, beforeMovedBinFilePath]) => out[binName] = getAfterMovedFilePath({
                        "beforeMovedFilePath": beforeMovedBinFilePath
                    }));
                    return out;
                })()
            } : {}),
            ...(!!packageJsonFilesResolved ? {
                "files": packageJsonFilesResolved
                    .map(beforeMovedFilesFilePath => getAfterMovedFilePath({
                    "beforeMovedFilePath": beforeMovedFilesFilePath
                }))
            } : {}),
            "scripts": undefined
        }, null, ((_a = packageJsonRaw
            .replace(/\t/g, "    ")
            .match(/^(\s*)\"name\"/m)) !== null && _a !== void 0 ? _a : [{ "length": 2 }])[1].length) + packageJsonRaw.match(/}([\r\n]*)$/)[1];
        console.log(`${isDryRun ? "(dry)" : ""} package.json:\n${newPackageJsonRaw}`);
        if (isDryRun) {
            break walk;
        }
        fs.writeFileSync("package.json", Buffer.from(newPackageJsonRaw, "utf8"));
    }
}
if (require.main === module) {
    process.once("unhandledRejection", error => { throw error; });
    const { isDryRun } = getIsDryRun_1.getIsDryRun();
    run({
        "pathToTargetModule": ".",
        isDryRun
    });
}
//# sourceMappingURL=enableShortNpmImportPath.js.map