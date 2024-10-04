import * as fs from "fs";
import { join as pathJoin, dirname as pathDirname, relative as pathRelative } from "path";
import { assert } from "tsafe/assert";
import chalk from "chalk";
import { same } from "evt/tools/inDepth/same";
import { getThisCodebaseRootDirPath } from "./tools/getThisCodebaseRootDirPath";
import { getAbsoluteAndInOsFormatPath } from "./tools/getAbsoluteAndInOsFormatPath";
import { run } from "./shared/run";

console.log(chalk.cyan("Building Denoify..."));

const startTime = Date.now();

const packageJsonFilePath = pathJoin(getThisCodebaseRootDirPath(), "package.json");

const parsedPackageJson: { bin: Record<string, string> } = JSON.parse(fs.readFileSync(packageJsonFilePath).toString("utf8"));

const distDirPath = pathJoin(getThisCodebaseRootDirPath(), "dist");
const srcDirPath = pathJoin(getThisCodebaseRootDirPath(), "src");

const entrypointFilePaths = Object.values(parsedPackageJson.bin).map(fileRelativePath =>
    getAbsoluteAndInOsFormatPath({
        "pathIsh": fileRelativePath,
        "cwd": pathDirname(packageJsonFilePath)
    })
);

const getOriginalFilePath = (entrypointFilePath: string) => entrypointFilePath.replace(/js$/, "original.js");

for (const entrypointFilePath of entrypointFilePaths) {
    const entrypointFilePath_original = getOriginalFilePath(entrypointFilePath);

    if (fs.existsSync(entrypointFilePath_original)) {
        fs.renameSync(entrypointFilePath_original, entrypointFilePath);
    }
}

run("npx tsc");

for (const entrypointFilePath of entrypointFilePaths) {
    if (!fs.readFileSync(entrypointFilePath).toString("utf8").includes("__nccwpck_require__")) {
        fs.cpSync(entrypointFilePath, getOriginalFilePath(entrypointFilePath));
    }
}

for (const entrypointFilePath of entrypointFilePaths) {
    const nccOutDirPath = pathJoin(distDirPath, "ncc_out");

    run(`npx ncc build ${entrypointFilePath} -o ${nccOutDirPath}`);

    assert(same(fs.readdirSync(nccOutDirPath), ["index.js"]));

    fs.cpSync(pathJoin(nccOutDirPath, "index.js"), entrypointFilePath);

    fs.rmSync(nccOutDirPath, { recursive: true });

    fs.chmodSync(entrypointFilePath, fs.statSync(entrypointFilePath).mode | fs.constants.S_IXUSR | fs.constants.S_IXGRP | fs.constants.S_IXOTH);
}

console.log(chalk.green(`✓ built in ${((Date.now() - startTime) / 1000).toFixed(2)}s`));
