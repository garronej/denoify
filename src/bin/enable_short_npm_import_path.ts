#!/usr/bin/env node

import * as path from "path";
import { pathDepth } from "../tools/pathDepth";
import { moveContentUpOneLevelFactory } from "../tools/moveContentUpOneLevel";
import { getIsDryRun } from "./lib/getIsDryRun";
import * as fs from "fs";
import * as commentJson from "comment-json";
import { resolvePathsWithWildcards } from "../tools/resolvePathsWithWildcards";

/**
 * To disable dry run mode  DRY_RUN=1 env variable must be set.
 * This function Change change the working directory.
 * */
async function run(params: { pathToTargetModule: string; isDryRun: boolean }) {
    const { isDryRun } = params;

    const { moveContentUpOneLevel } = moveContentUpOneLevelFactory({ isDryRun });

    process.chdir(params.pathToTargetModule);

    if (fs.existsSync(".npmignore")) {
        throw new Error(".npmignore not supported, please use package.json 'files' instead");
    }

    const packageJsonRaw = fs.readFileSync("package.json").toString("utf8");

    const packageJsonParsed = JSON.parse(packageJsonRaw);

    const packageJsonFilesResolved: string[] | undefined = await (() => {
        const pathWithWildcards: string[] | undefined = packageJsonParsed.files;
        return !pathWithWildcards ? undefined : resolvePathsWithWildcards({ pathWithWildcards });
    })();

    const { srcDirPath, tsconfigOutDir } = {
        "srcDirPath": ["src", "lib"].find(sourceDirPath => fs.existsSync(sourceDirPath)),
        "tsconfigOutDir": commentJson.parse(
            fs.readFileSync(fs.existsSync("./tsproject.json") ? "./tsproject.json" : "./tsconfig.json").toString("utf8")
        )["compilerOptions"]["outDir"] as string
    };
    if (srcDirPath === undefined) {
        throw new Error("There should be a 'src' or 'lib' dir containing the .ts files");
    }

    if (pathDepth(tsconfigOutDir) !== 1) {
        throw new Error("For this script to work tsconfig out dir must be a directory at the root of the project");
    }

    const moveSourceFiles = "types" in packageJsonParsed ? !packageJsonParsed["types"].match(/\.d\.ts$/i) : false;
    console.log(moveSourceFiles ? "Putting .ts files alongside .js files" : "Leaving .ts file in the src/ directory");

    const beforeMovedFilePaths = await (async () => {
        const moveAndReplace = (dirPath: string) =>
            moveContentUpOneLevel({ dirPath }).then(({ beforeMovedFilePaths }) => beforeMovedFilePaths.map(filePath => path.join(dirPath, filePath)));
        return [...(await moveAndReplace(tsconfigOutDir)), ...(moveSourceFiles ? await moveAndReplace(srcDirPath) : [])];
    })();

    const getAfterMovedFilePath = (params: { beforeMovedFilePath: string }) => {
        const beforeMovedFilePath = beforeMovedFilePaths.find(
            beforeMovedFilePath => path.relative(beforeMovedFilePath, params.beforeMovedFilePath) === ""
        );

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
        .filter(beforeMovedFilePath => /\.c?js\.map$/.test(beforeMovedFilePath))
        .forEach(beforeMovedSourceMapFilePath => {
            const afterMovedSourceMapFilePath = getAfterMovedFilePath({
                "beforeMovedFilePath": beforeMovedSourceMapFilePath
            });

            const sourceMapParsed: { sources: string[] } = JSON.parse(
                fs.readFileSync(isDryRun ? beforeMovedSourceMapFilePath : afterMovedSourceMapFilePath).toString("utf8")
            );

            const sources = sourceMapParsed.sources.map(filePath =>
                path.relative(
                    path.dirname(afterMovedSourceMapFilePath),
                    getAfterMovedFilePath({
                        "beforeMovedFilePath": path.join(path.dirname(beforeMovedSourceMapFilePath), filePath)
                    })
                )
            );
            console.log(
                [
                    `${isDryRun ? "(dry) " : ""}Editing ${path.basename(beforeMovedSourceMapFilePath)}:`,
                    JSON.stringify({ "sources": sourceMapParsed.sources }),
                    `-> ${JSON.stringify({ sources })}`
                ].join(" ")
            );

            walk: {
                if (isDryRun) {
                    break walk;
                }

                fs.writeFileSync(
                    afterMovedSourceMapFilePath,
                    Buffer.from(
                        JSON.stringify({
                            ...sourceMapParsed,
                            sources
                        }),
                        "utf8"
                    )
                );
            }
        });

    walk: {
        const newPackageJsonRaw =
            JSON.stringify(
                {
                    ...packageJsonParsed,
                    ...("main" in packageJsonParsed
                        ? {
                              "main": getAfterMovedFilePath({
                                  "beforeMovedFilePath": packageJsonParsed["main"]
                              })
                          }
                        : {}),
                    ...("types" in packageJsonParsed
                        ? {
                              "types": getAfterMovedFilePath({
                                  "beforeMovedFilePath": packageJsonParsed["types"]
                              })
                          }
                        : {}),
                    ...("module" in packageJsonParsed
                        ? {
                              "module": getAfterMovedFilePath({
                                  "beforeMovedFilePath": packageJsonParsed["module"]
                              })
                          }
                        : {}),
                    ...("exports" in packageJsonParsed
                        ? {
                              "exports": Object.fromEntries(
                                  Object.entries(packageJsonParsed["exports"]).map(([path, pathOrObj]) => [
                                      path,
                                      (() => {
                                          const fRec = <T extends string | Record<string, unknown>>(pathOrObj: T): T =>
                                              typeof pathOrObj === "string"
                                                  ? `./${getAfterMovedFilePath({ "beforeMovedFilePath": pathOrObj })}`
                                                  : (Object.fromEntries(
                                                        Object.entries(pathOrObj).map(([type, pathOrObj]) => [type, fRec(pathOrObj as any)])
                                                    ) as any);

                                          return fRec(pathOrObj as any);
                                      })()
                                  ])
                              )
                          }
                        : {}),
                    ...("bin" in packageJsonParsed
                        ? {
                              "bin": (() => {
                                  const out: Record<string, string> = {};

                                  Object.keys(packageJsonParsed.bin)
                                      .map(binName => [binName, packageJsonParsed.bin[binName]] as const)
                                      .forEach(
                                          ([binName, beforeMovedBinFilePath]) =>
                                              (out[binName] = getAfterMovedFilePath({
                                                  "beforeMovedFilePath": beforeMovedBinFilePath
                                              }))
                                      );

                                  return out;
                              })()
                          }
                        : {}),
                    ...(!!packageJsonFilesResolved
                        ? {
                              "files": packageJsonFilesResolved.map(beforeMovedFilesFilePath =>
                                  getAfterMovedFilePath({
                                      "beforeMovedFilePath": beforeMovedFilesFilePath
                                  })
                              )
                          }
                        : {}),
                    "scripts": undefined
                },
                null,
                (packageJsonRaw.replace(/\t/g, "    ").match(/^(\s*)\"name\"/m) ?? [{ "length": 2 }])[1].length
            ) + packageJsonRaw.match(/}([\r\n]*)$/)![1];

        console.log(`${isDryRun ? "(dry)" : ""} package.json:\n${newPackageJsonRaw}`);

        if (isDryRun) {
            break walk;
        }

        fs.writeFileSync("package.json", Buffer.from(newPackageJsonRaw, "utf8"));
    }
}

if (require.main === module) {
    process.once("unhandledRejection", error => {
        throw error;
    });

    const { isDryRun } = getIsDryRun();

    run({
        "pathToTargetModule": ".",
        isDryRun
    });
}
