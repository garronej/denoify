#!/usr/bin/env node

import { normalize as pathNormalize } from "path";
import { getIsDryRun } from "./lib/getIsDryRun";
import * as fs from "fs";
import * as commentJson from "comment-json";
import { removeFromGitignore } from "../tools/removeFromGitignore";
import { toPosix } from "../tools/toPosix";
import { parseAsDenoifyConfig } from "../lib/config/parseParams";
import { getFileTypeAndContent } from "../lib/config/fileAndContent";
import { getLocalFileContents } from "../tools/getFileContents";
import { assert } from "tsafe";

const { getDenoifyOutDir } = (() => {
    async function getExplicitDenoifyOutDir(params: { moduleDirPath: string }) {
        const { moduleDirPath } = params;

        const denoifyOut = parseAsDenoifyConfig({
            "configFileType": await getFileTypeAndContent({
                "getConfigFileRawContent": fileBaseName => getLocalFileContents({ moduleDirPath, fileBaseName })
            })
        })?.out;

        if (denoifyOut === undefined) {
            return undefined;
        }

        return pathNormalize(toPosix(denoifyOut));
    }

    async function getTsconfigOutDir(params: { moduleDirPath: string }): Promise<string | undefined> {
        const { moduleDirPath } = params;

        const tsconfigJson = await getLocalFileContents({ moduleDirPath, fileBaseName: "tsconfig.json" });
        assert(tsconfigJson !== undefined, "There's no tsconfig.json");

        const outDir: string | undefined = commentJson.parse(tsconfigJson)["compilerOptions"]?.["outDir"];

        if (typeof outDir !== "string") {
            return undefined;
        }

        return pathNormalize(toPosix(outDir));
    }

    async function getDenoifyOutDir(params: { moduleDirPath: string }) {
        const { moduleDirPath } = params;

        explicitly_specified: {
            const denoifyOutDir = await getExplicitDenoifyOutDir({ moduleDirPath });

            if (denoifyOutDir === undefined) {
                break explicitly_specified;
            }

            return denoifyOutDir;
        }

        default_based_on_tsconfig_outDir: {
            const tsconfigOutDir = getTsconfigOutDir({ moduleDirPath });

            if (tsconfigOutDir === undefined) {
                break default_based_on_tsconfig_outDir;
            }
        }

        return undefined;
    }

    return { getDenoifyOutDir };
})();

/**
 * To disable dry run mode  DRY_RUN=1 env variable must be set.
 * This function Change change the working directory.
 * */
export async function run(params: { moduleDirPath: string; isDryRun: boolean }) {
    const { moduleDirPath, isDryRun } = params;

    const denoifyOutDir = await getDenoifyOutDir({ moduleDirPath });

    if (denoifyOutDir === undefined) {
        throw new Error("Wrong assertion encountered");
    }

    try {
        fs.accessSync(denoifyOutDir);
    } catch {
        console.log("exit 1");
        return;
    }

    const { fixedGitignoreRaw } = removeFromGitignore({
        "pathToTargetModule": moduleDirPath,
        "fileOrDirPathsToAccept": [denoifyOutDir]
    });

    if (!fixedGitignoreRaw) {
        console.log("exit 2");
        return;
    }

    console.log(`\n${isDryRun ? "(dry)" : ""} .gitignore:\n\n${fixedGitignoreRaw}`);

    if (isDryRun) {
        return;
    }

    fs.writeFileSync(".gitignore", Buffer.from(fixedGitignoreRaw, "utf8"));
}

if (require.main === module) {
    process.once("unhandledRejection", error => {
        throw error;
    });

    const { isDryRun } = getIsDryRun();

    run({
        "moduleDirPath": ".",
        isDryRun
    });
}
