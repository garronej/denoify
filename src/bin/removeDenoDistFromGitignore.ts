#!/usr/bin/env node

import * as path from "path";
import { getIsDryRun } from "./lib/getIsDryRun";
import * as fs from "fs";
import * as commentJson from "comment-json";
import { removeFromGitignore } from "../tools/removeFromGitignore";

//TODO: Test on windows! 

/** 
 * To disable dry run mode  DRY_RUN=1 env variable must be set.
 * This function Change change the working directory.
 * */
async function run(
    params: {
        pathToTargetModule: string;
        denoDistDirPath: string | undefined;
        isDryRun: boolean;
    }
) {

    const {
        pathToTargetModule,
        isDryRun,
        denoDistDirPath = (() => {

            const tsconfigOutDir =
                commentJson.parse(
                    fs.readFileSync("./tsconfig.json")
                        .toString("utf8")
                )["compilerOptions"]["outDir"] as string
                ;

            return path.join(
                path.dirname(tsconfigOutDir),
                `deno_${path.basename(tsconfigOutDir)}`
            ); // ./deno_dist

        })()
    } = params;

    process.chdir(pathToTargetModule);

    if (!fs.existsSync(denoDistDirPath)) {
        console.log("exit 1");
        return;
    }

    const { fixedGitignoreRaw } = removeFromGitignore({
        "pathToTargetModule": ".",
        "fileOrDirPathsToAccept": [denoDistDirPath]
    });

    if (!fixedGitignoreRaw) {
        console.log("exit 2");
        return;
    }

    console.log(`\n${isDryRun ? "(dry)" : ""} .gitignore:\n\n${fixedGitignoreRaw}`);

    if (isDryRun) {
        return;
    }

    fs.writeFileSync(
        ".gitignore",
        Buffer.from(fixedGitignoreRaw, "utf8")
    );

}

if (require.main === module) {
    process.once("unhandledRejection", error => { throw error; });

    const { isDryRun } = getIsDryRun();

    run({
        "pathToTargetModule": ".",
        "denoDistDirPath": process.argv[2],
        isDryRun
    });
}
