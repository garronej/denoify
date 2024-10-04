import * as fs from "fs";
import { join as pathJoin, dirname as pathDirname, basename as pathBasename } from "path";
import chalk from "chalk";
import { getThisCodebaseRootDirPath } from "./tools/getThisCodebaseRootDirPath";
import { getAbsoluteAndInOsFormatPath } from "./tools/getAbsoluteAndInOsFormatPath";
import { run } from "./shared/run";
import { transformCodebase } from "./tools/transformCodebase";

console.log(chalk.cyan("Building Denoify..."));

const startTime = Date.now();

const distDirPath = pathJoin(getThisCodebaseRootDirPath(), "dist");

clean: {
    if (!fs.existsSync(distDirPath)) {
        break clean;
    }

    transformCodebase({
        "srcDirPath": distDirPath,
        "destDirPath": distDirPath,
        "transformSourceCode": ({ filePath, sourceCode }) => {
            if (filePath === "package.json") {
                return { "modifiedSourceCode": sourceCode };
            }

            return undefined;
        }
    });
}

const packageJsonFilePath = pathJoin(getThisCodebaseRootDirPath(), "package.json");

const parsedPackageJson: { bin: Record<string, string> } = JSON.parse(fs.readFileSync(packageJsonFilePath).toString("utf8"));

const entrypointFilePaths = [
    ...Object.values(parsedPackageJson.bin),
    pathJoin(distDirPath, "index.js"),
    pathJoin(distDirPath, "bin", "replacer", "index.js")
].map(fileRelativePath =>
    getAbsoluteAndInOsFormatPath({
        "pathIsh": fileRelativePath,
        "cwd": pathDirname(packageJsonFilePath)
    })
);

run("npx tsc");

const nccGeneratedFilePaths: string[] = [];

for (const entrypointFilePath of entrypointFilePaths) {
    const nccOutDirPath = pathJoin(distDirPath, "ncc_out");

    run(`npx ncc build ${entrypointFilePath} -o ${nccOutDirPath}`);

    fs.readdirSync(nccOutDirPath).forEach(basename => {
        const destFilePath = basename === "index.js" ? entrypointFilePath : pathJoin(pathDirname(entrypointFilePath), basename);
        const srcFilePath = pathJoin(nccOutDirPath, basename);

        check_can_be_overwritten: {
            if (basename === "index.js") {
                break check_can_be_overwritten;
            }

            if (!fs.existsSync(destFilePath)) {
                break check_can_be_overwritten;
            }

            const currentContent = fs.readFileSync(destFilePath);
            const candidateContent = fs.readFileSync(srcFilePath);

            if (Buffer.compare(currentContent, candidateContent) === 0) {
                break check_can_be_overwritten;
            }

            throw new Error(`File ${destFilePath} already exists and is different from the one that would be written`);
        }

        fs.cpSync(srcFilePath, destFilePath);
        nccGeneratedFilePaths.push(destFilePath);
    });

    fs.rmSync(nccOutDirPath, { recursive: true });

    fs.chmodSync(entrypointFilePath, fs.statSync(entrypointFilePath).mode | fs.constants.S_IXUSR | fs.constants.S_IXGRP | fs.constants.S_IXOTH);
}

transformCodebase({
    "srcDirPath": distDirPath,
    "destDirPath": distDirPath,
    "transformSourceCode": ({ filePath, sourceCode }) => {
        if (nccGeneratedFilePaths.includes(filePath)) {
            return { "modifiedSourceCode": sourceCode };
        }

        if (filePath.endsWith(".d.ts")) {
            return { "modifiedSourceCode": sourceCode };
        }

        return undefined;
    }
});

console.log(chalk.green(`✓ built in ${((Date.now() - startTime) / 1000).toFixed(2)}s`));
