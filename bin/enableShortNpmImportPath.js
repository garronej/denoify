#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const globProxy_1 = require("../tools/globProxy");
const modTsFile_1 = require("../lib/modTsFile");
const pathDepth_1 = require("../tools/pathDepth");
const moveContentUpOneLevel_1 = require("../tools/moveContentUpOneLevel");
const isInsideOrIsDir_1 = require("../tools/isInsideOrIsDir");
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
    const { isDryRun } = getIsDryRun_1.getIsDryRun();
    const { exec } = exec_1.execFactory({ isDryRun });
    const { moveContentUpOneLevel } = moveContentUpOneLevel_1.moveContentUpOneLevelFactory({ isDryRun });
    process.chdir(params.pathToTargetModule);
    if (fs.existsSync(".npmignore")) {
        throw new Error(".npmignore not supported, please use package.json 'files' instead");
    }
    const packageJsonParsed = JSON.parse(fs.readFileSync("package.json")
        .toString("utf8"));
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
        throw new Error("tsconfig out dir must be a directory at the root of the project for this script to work");
    }
    if (!!packageJsonFilesResolved &&
        packageJsonFilesResolved.find(fileOrDirPath => isInsideOrIsDir_1.isInsideOrIsDir({
            "dirPath": srcDirPath,
            fileOrDirPath
        }))) {
        throw new Error(`Can't include file from ${srcDirPath} in the NPM module`);
    }
    await exec(`rm -r ${srcDirPath}`);
    if (!!denoDistPath) {
        await exec(`rm -r ${denoDistPath}`);
    }
    await moveContentUpOneLevel({ "dirPath": tsconfigOutDir });
    {
        const newPackageJsonRaw = JSON.stringify({
            ...packageJsonParsed,
            ...("main" in packageJsonParsed ? {
                "main": path.relative(tsconfigOutDir, packageJsonParsed.main)
            } : {}),
            ...("types" in packageJsonParsed ? {
                "types": path.relative(tsconfigOutDir, packageJsonParsed.types)
            } : {}),
            ...("bin" in packageJsonParsed ? {
                "bin": (() => {
                    const out = {};
                    Object.keys(packageJsonParsed.bin)
                        .map(binName => [binName, packageJsonParsed.bin[binName]])
                        .forEach(([binName, binFilePath]) => out[binName] = path.relative(isInsideOrIsDir_1.isInsideOrIsDir({
                        "dirPath": tsconfigOutDir,
                        "fileOrDirPath": binFilePath
                    }) ?
                        tsconfigOutDir : ".", binFilePath));
                    return out;
                })()
            } : {}),
            ...(!!packageJsonFilesResolved ? {
                "files": packageJsonFilesResolved
                    .map(fileOrDirPath => path.relative(isInsideOrIsDir_1.isInsideOrIsDir({
                    "dirPath": tsconfigOutDir,
                    fileOrDirPath
                }) ?
                    tsconfigOutDir : ".", // ./dist : .
                fileOrDirPath // ./dist/lib
                ) // ./lib
                )
            } : {}),
            "scripts": undefined
        }, null, 2);
        console.log(`${isDryRun ? "(dry)" : ""} package.json:\n${newPackageJsonRaw}`);
        if (!isDryRun) {
            fs.writeFileSync("package.json", Buffer.from(newPackageJsonRaw, "utf8"));
        }
    }
}
if (require.main === module) {
    process.once("unhandledRejection", error => { throw error; });
    run({ "pathToTargetModule": "." });
}
//# sourceMappingURL=enableShortNpmImportPath.js.map