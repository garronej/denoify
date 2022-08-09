import { isInsideOrIsDir } from "./isInsideOrIsDir";
import * as fs from "fs";
import { crawl } from "./crawl";
import * as path from "path";
const gitignoreParser: {
    compile: (raw: string) => {
        accepts: (fileOrDirPath: string) => boolean;
        denies: (fileOrDirPath: string) => boolean;
    };
} = require("gitignore-parser");

export function removeFromGitignore(params: { pathToTargetModule: string; fileOrDirPathsToAccept: string[] }): {
    fixedGitignoreRaw: string | undefined;
} {
    const { fileOrDirPathsToAccept, pathToTargetModule } = params;

    if (!fs.existsSync(path.join(pathToTargetModule, ".gitignore"))) {
        console.log("No .gitignore file");
        return { "fixedGitignoreRaw": undefined };
    }

    const gitignore = gitignoreParser.compile(fs.readFileSync(path.join(pathToTargetModule, ".gitignore")).toString("utf8"));

    let fixedGitignoreRaw = crawl(pathToTargetModule)
        .filter(filePath => {
            for (const fileOrDirPathToAccept of fileOrDirPathsToAccept) {
                if (
                    fs.existsSync(fileOrDirPathToAccept)
                        ? fs.lstatSync(fileOrDirPathToAccept).isDirectory()
                        : fileOrDirPathToAccept.endsWith("/") || !fileOrDirPathToAccept.match(/\.[^\.]{1,6}$/)
                ) {
                    if (
                        isInsideOrIsDir({
                            "dirPath": fileOrDirPathToAccept,
                            "fileOrDirPath": filePath
                        })
                    ) {
                        return false;
                    }
                }

                if (path.relative(fileOrDirPathToAccept, filePath) === "") {
                    return false;
                }
            }

            return gitignore.denies(filePath);
        })
        .map(filePath => "/" + filePath.replace(/^\.\//, ""))
        .join("\n");
    //NOTE: Optimization: if node_modules is excluded do not list every files, just exclude /node_modules
    if (
        gitignore.denies("node_modules/") &&
        !fileOrDirPathsToAccept.map(fileOrDirPath => isInsideOrIsDir({ "dirPath": "node_modules", fileOrDirPath })).includes(true)
    ) {
        fixedGitignoreRaw =
            fixedGitignoreRaw
                .split("\n")
                .filter(line => !line.startsWith("/node_modules"))
                .join("\n") + "\n/node_modules\n";
    }

    return { fixedGitignoreRaw };
}
