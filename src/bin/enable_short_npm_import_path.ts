#!/usr/bin/env node

import * as path from "path";
import { pathDepth } from "../tools/pathDepth";
import { moveContentUpOneLevelFactory } from "../tools/moveContentUpOneLevel";
import { getIsDryRun } from "./lib/getIsDryRun";
import * as fs from "fs";
import * as commentJson from "comment-json";
import { resolvePathsWithWildcards } from "../tools/resolvePathsWithWildcards";
import { assert } from "tsafe/assert";
import { is } from "tsafe/is";
import { removeDuplicates } from "evt/tools/reducers/removeDuplicates";
import { same } from "evt/tools/inDepth/same";
import { isInsideOrIsDir } from "../tools/isInsideOrIsDir";

/**
 * To disable dry run mode  DRY_RUN=1 env variable must be set.
 * This function Change change the working directory.
 * */
async function run(params: { pathToTargetModule: string; isDryRun: boolean }) {
    const { isDryRun } = params;

    process.chdir(params.pathToTargetModule);

    if (fs.existsSync(".npmignore")) {
        throw new Error(".npmignore not supported, please use package.json 'files' instead");
    }

    const packageJsonRaw = fs.readFileSync("package.json").toString("utf8");

    const packageJsonParsed = JSON.parse(packageJsonRaw);

    const packageJsonFilesResolved: string[] | undefined = (() => {
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
        throw new Error("For this script to work tsconfig outDir must be a directory at the root of the project");
    }

    const moveSourceFiles = "types" in packageJsonParsed ? !packageJsonParsed["types"].match(/\.d\.ts$/i) : false;
    console.log(moveSourceFiles ? "Putting .ts files alongside .js files" : "Leaving .ts file in the src/ directory");

    const { beforeMovedFilePaths, moveFiles } = await (async () => {
        const getBeforeMovedFilePaths = async (isDryRun: boolean, log: typeof console.log | undefined) => {
            const { moveContentUpOneLevel } = moveContentUpOneLevelFactory({ isDryRun, log });

            const moveAndGetBeforePath = (dirPath: string) =>
                moveContentUpOneLevel({ dirPath }).then(({ beforeMovedFilePaths }) =>
                    beforeMovedFilePaths.map(filePath => path.join(dirPath, filePath))
                );

            return [...(await moveAndGetBeforePath(tsconfigOutDir)), ...(moveSourceFiles ? await moveAndGetBeforePath(srcDirPath) : [])];
        };

        return {
            "beforeMovedFilePaths": await getBeforeMovedFilePaths(true, undefined),
            "moveFiles": async () => {
                await getBeforeMovedFilePaths(isDryRun, undefined);
            }
        };
    })();

    const getAfterMovedFilePath = (params: { beforeMovedFilePath: string }) => {
        const { beforeMovedFilePath } = params;

        const beforeMovedFilePathFromList = beforeMovedFilePaths.find(
            beforeMovedFilePathFromList => path.relative(beforeMovedFilePathFromList, beforeMovedFilePath) === ""
        );

        if (beforeMovedFilePathFromList === undefined) {
            if (!isInsideOrIsDir({ "dirPath": tsconfigOutDir, "fileOrDirPath": beforeMovedFilePath })) {
                //NOTE: In case the path would be absolute.
                return "./" + path.relative(".", beforeMovedFilePath);
            }

            throw new Error(`${beforeMovedFilePath} is inside ${tsconfigOutDir} but it has't been moved`);
        }

        const afterMovedFilePath =
            "./" +
            beforeMovedFilePathFromList
                .replace(/^\.\//, "")
                .split(path.sep)
                .filter((...[, index]) => index !== 0)
                .join(path.sep);

        return afterMovedFilePath;
    };

    update_package_json: {
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
                                  Object.entries(packageJsonParsed["exports"])
                                      .map(([exportPath, exportPathResolutionOptions]): [string, RecObj][] => {
                                          assert(is<RecObj>(exportPathResolutionOptions));

                                          if (!exportPath.includes("*")) {
                                              let json = JSON.stringify(exportPathResolutionOptions);

                                              for (const path of collectStrings(exportPathResolutionOptions)) {
                                                  json = replaceAllOccurrences({
                                                      "str": json,
                                                      "searchValue": path,
                                                      "replaceValue": getAfterMovedFilePath({ "beforeMovedFilePath": path })
                                                  });
                                              }

                                              return [[exportPath, JSON.parse(json)]];
                                          } else {
                                              let result: {
                                                  wildcardMatch: string;
                                                  exportPathResolutionOption: RecObj;
                                              }[];

                                              try {
                                                  result = resolveExportsResolutionOptionsWithWildcard({
                                                      "exportPathResolutionOptionsWithWildcards": exportPathResolutionOptions,
                                                      "resolvePathWithExportsWildcard": ({ pathWithExportsWildcard }) =>
                                                          resolvePathsWithWildcards({
                                                              "pathWithWildcards": [
                                                                  (() => {
                                                                      assert(pathWithExportsWildcard.split("*").length === 2);

                                                                      return pathWithExportsWildcard.replace("*", "**/*");
                                                                  })()
                                                              ]
                                                          }),
                                                      getAfterMovedFilePath
                                                  });
                                              } catch (error) {
                                                  console.log(String(error));
                                                  return [];
                                              }

                                              return result.map(({ wildcardMatch, exportPathResolutionOption }) => [
                                                  exportPath.replace("*", wildcardMatch),
                                                  exportPathResolutionOption
                                              ]);
                                          }
                                      })
                                      .flat()
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
                                          async ([binName, beforeMovedBinFilePath]) =>
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
            break update_package_json;
        }

        fs.writeFileSync("package.json", Buffer.from(newPackageJsonRaw, "utf8"));
    }

    await moveFiles();

    beforeMovedFilePaths
        .filter(beforeMovedFilePath => /\.[cm]?js\.map$/.test(beforeMovedFilePath))
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
}

type RecObj = string | Record<string, unknown /*RecObj*/>;

function collectStrings(objRec: RecObj): string[] {
    if (typeof objRec === "string") {
        return [objRec];
    }

    return Object.values(objRec)
        .map(value => {
            assert(is<RecObj>(value));
            return collectStrings(value);
        })
        .flat()
        .reduce(...removeDuplicates<string>());
}

const replaceAllOccurrences = (params: { str: string; searchValue: string; replaceValue: string }) => {
    const { str, searchValue, replaceValue } = params;
    return str.split(searchValue).join(replaceValue);
};

function resolveExportsResolutionOptionsWithWildcard(params: {
    exportPathResolutionOptionsWithWildcards: RecObj;
    resolvePathWithExportsWildcard: (params: { pathWithExportsWildcard: string }) => string[];
    getAfterMovedFilePath: (params: { beforeMovedFilePath: string }) => string;
}): {
    wildcardMatch: string;
    exportPathResolutionOption: RecObj;
}[] {
    /*
    {
        "require": "./dist/*.js",
        "import": "./dist/esm/*.mjs"
    }

    ---->  collectStrings --->

    ["./dist/*.js", "./dist/esm/*.mjs"]

    "./dist/*.js" --> resolvePathWithExportWildcard ---> [ "./dist/a.js", "./dist/b.js" ]
    "./dist/esm/*.js" --> resolvePathWithExportsWildcard ---> [ "./dist/esm/a.js", "./dist/esm/b.js" ]

    "./dist/*.js" , [ "./dist/a.js", "./dist/b.js" ] --> getWildcardMatches --> [ "a", "b" ]
    "./dist/esm/*.js" , [ "./dist/esm/a.js", "./dist/esm/b.js" ] --> getWildcardMatches --> [ "b", "a" ]

    assert(sameSet(["a", "b"], ["b", "a"]));

    loop over the wildcard matches, first a

    '{ "require": "./dist/*.js", "import": "./dist/esm/*.mjs" }', "*", "a"
    --> replaceAllOccurrences --> '{ "require": "./dist/a.js", "import": "./dist/esm/a.mjs" }'

    "./dist/a.js" --> getAfterMovedFilePath --> "./a.js"
    "./dist/b.js" --> getAfterMovedFilePath --> "./b.js"
    "./dist/esm/a.js" --> getAfterMovedFilePath --> "./esm/a.js"
    "./dist/esm/b.js" --> getAfterMovedFilePath --> "./esm/b.js"
    

    '{ "require": "./dist/a.js", "import": "./dist/esm/a.mjs" }', "./dist/a.js", "./a.js"
    --> replaceAllOccurrences --> '{ "require": "./a.js", "import": ".dist/esm/a.mjs" }'

    '{ "require": "./dist/a.js", "import": "./dist/esm/a.mjs" }', "./dist/b.js", "./b.js"
    --> replaceAllOccurrences --> '{ "require": "./a.js", "import": ".dist/esm/a.mjs" }' (unchanged)

    '{ "require": "./dist/a.js", "import": "./dist/esm/a.mjs" }', "./dist/esm/a.js", "./esm/a.js"
    --> replaceAllOccurrences --> '{ "require": "./a.js", "import": "./esm/a.mjs" }'

    '{ "require": "./dist/a.js", "import": "./dist/esm/a.mjs" }', "./dist/esm/b.js", "./esm/b.js"
    --> replaceAllOccurrences --> '{ "require": "./a.js", "import": "./esm/a.mjs" }' (unchanged)

    One entry of the return { "wildcardMatch": "a", "exportPathResolutionOption": JSON.parse('{ "require": "./a.js", "import": "./esm/a.mjs" }') }

    end loop

    */

    const getWildcardMatches = (params: { pathWithExportWildcard: string; paths: string[] }): string[] => {
        const { pathWithExportWildcard, paths } = params;

        const [prefix, suffix] = pathWithExportWildcard.split("*");

        return paths.map(path => path.replace(prefix, "").replace(suffix, ""));
    };

    const { exportPathResolutionOptionsWithWildcards, resolvePathWithExportsWildcard, getAfterMovedFilePath } = params;

    const pathWithExportsWildcards = collectStrings(exportPathResolutionOptionsWithWildcards);

    const pathsByPathWithExportsWildcard: Record<string, string[]> = Object.fromEntries(
        pathWithExportsWildcards.map(pathWithExportsWildcard => [
            pathWithExportsWildcard,
            resolvePathWithExportsWildcard({ pathWithExportsWildcard }).map(path => `./${path}`)
        ])
    );

    let wildcardMatches: string[] | undefined = undefined;

    for (const pathWithExportWildcard of pathWithExportsWildcards) {
        const wildcardMatches_i = getWildcardMatches({
            pathWithExportWildcard,
            "paths": pathsByPathWithExportsWildcard[pathWithExportWildcard]
        });

        if (wildcardMatches === undefined) {
            wildcardMatches = wildcardMatches_i;
            continue;
        }

        assert(same(wildcardMatches, wildcardMatches_i, { "takeIntoAccountArraysOrdering": false }));
    }

    assert(wildcardMatches !== undefined);

    return wildcardMatches.map(wildcardMatch => {
        let json = JSON.stringify(exportPathResolutionOptionsWithWildcards);

        json = replaceAllOccurrences({
            "str": json,
            "searchValue": "*",
            "replaceValue": wildcardMatch
        });

        for (const path of Object.values(pathsByPathWithExportsWildcard).flat()) {
            json = replaceAllOccurrences({
                "str": json,
                "searchValue": path,
                "replaceValue": getAfterMovedFilePath({ "beforeMovedFilePath": path })
            });
        }

        return {
            wildcardMatch,
            "exportPathResolutionOption": JSON.parse(json)
        };
    });
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
