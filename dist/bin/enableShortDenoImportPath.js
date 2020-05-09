#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const modTsFile_1 = require("../lib/modTsFile");
const pathDepth_1 = require("../tools/pathDepth");
const moveContentUpOneLevel_1 = require("../tools/moveContentUpOneLevel");
const exec_1 = require("../tools/exec");
const getIsDryRun_1 = require("../lib/getIsDryRun");
const removeFromGitignore_1 = require("../tools/removeFromGitignore");
const fs = require("fs");
/**
 * To disable dry run mode  DRY_RUN=1 env variable must be set.
 * This function Change change the working directory.
 * */
async function run(params) {
    const { isDryRun } = getIsDryRun_1.getIsDryRun();
    const { exec } = exec_1.execFactory({ isDryRun });
    const { moveContentUpOneLevel } = moveContentUpOneLevel_1.moveContentUpOneLevelFactory({ isDryRun });
    process.chdir(params.pathToTargetModule);
    const { srcDirPath, denoDistPath, tsconfigOutDir } = modTsFile_1.modTsFile.parseMetadata({ "projectPath": "." });
    if (pathDepth_1.pathDepth(tsconfigOutDir) != 1) {
        throw new Error("tsconfig out dir must be a directory at the root of the project for this script to work");
    }
    modTsFile_1.modTsFile.create({
        "tsFilePath": path.relative(tsconfigOutDir, // ./dist
        JSON.parse(fs.readFileSync("package.json").toString("utf8")).main // ./dist/lib/index.js
            .replace(/\.js$/i, ".ts")),
        "projectPath": ".",
        isDryRun
    });
    await exec(`rm -r ${srcDirPath}`);
    await exec(`rm -r ${tsconfigOutDir}`);
    await moveContentUpOneLevel({ "dirPath": denoDistPath });
    const { fixedGitignoreRaw } = removeFromGitignore_1.removeFromGitignore({
        "pathToTargetModule": ".",
        "fileOrDirPathsToAccept": [
            "./mod.ts",
            // NOTE: This files must not be included 
            // but we add them so that dry run and real run be consistent
            denoDistPath, tsconfigOutDir
        ]
    });
    if (!fixedGitignoreRaw) {
        return;
    }
    console.log(`\n${isDryRun ? "(dry)" : ""} .gitignore:\n\n${fixedGitignoreRaw}`);
    if (!isDryRun) {
        fs.writeFileSync(".gitignore", Buffer.from(fixedGitignoreRaw, "utf8"));
    }
}
if (require.main === module) {
    process.once("unhandledRejection", error => { throw error; });
    run({ "pathToTargetModule": "." });
}
