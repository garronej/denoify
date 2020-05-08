#!/usr/bin/env node

import * as path from "path";
import { modTsFile } from "../lib/modTsFile";
import { pathDepth } from "../tools/pathDepth";
import { moveContentUpOneLevelFactory } from "../tools/moveContentUpOneLevel"
import { execFactory } from "../tools/exec";
import { getIsDryRun } from "../lib/getIsDryRun";
import { removeFromGitignore } from "../tools/removeFromGitignore";
import * as fs from "fs";

/** 
 * To disable dry run mode  DRY_RUN=1 env variable must be set.
 * This function Change change the working directory.
 * */
async function run(params: { pathToTargetModule: string; }) {

    const { isDryRun } = getIsDryRun();


    const { exec } = execFactory({ isDryRun });
    const { moveContentUpOneLevel } = moveContentUpOneLevelFactory({ isDryRun });

    process.chdir(params.pathToTargetModule);

    const { srcDirPath, denoDistPath, tsconfigOutDir } = modTsFile.parseMetadata({ "projectPath": "." });

    if (pathDepth(tsconfigOutDir) != 1) {
        throw new Error("tsconfig out dir must be a directory at the root of the project for this script to work");
    }

    modTsFile.create({
        "tsFilePath": path.relative(
            tsconfigOutDir, // ./dist
            JSON.parse(fs.readFileSync("package.json").toString("utf8")).main // ./dist/lib/index.js
                .replace(/\.js$/i, ".ts"), // ./dist/lib/index.ts
        ), // ./lib/index.ts
        "projectPath": ".",
        isDryRun
    });

    await exec(`rm -r ${srcDirPath}`);
    await exec(`rm -r ${tsconfigOutDir}`);

    await moveContentUpOneLevel({ "dirPath": denoDistPath });

    const { fixedGitignoreRaw } = removeFromGitignore({
        "pathToTargetModule": ".",
        "fileOrDirPathsToAccept": [ 
            "./mod.ts",
            // NOTE: This files must not be included 
            // but we add them so that dry run and real run be consistent
            denoDistPath, tsconfigOutDir 
        ]
    });

    if( !fixedGitignoreRaw ){
        return;
    }

    console.log(`\n${isDryRun?"(dry)":""} .gitignore:\n\n${fixedGitignoreRaw}`);

    if( !isDryRun ){

        fs.writeFileSync(
            ".gitignore",
            Buffer.from(fixedGitignoreRaw,"utf8")
        );

    }

}

if (require.main === module) {
    run({ "pathToTargetModule": "." });
}

