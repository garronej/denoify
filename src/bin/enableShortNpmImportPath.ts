#!/usr/bin/env node

import * as path from "path";
import { globProxyFactory } from "../tools/globProxy";
import { modTsFile } from "../lib/modTsFile";
import { pathDepth } from "../tools/pathDepth";
import { moveContentUpOneLevelFactory } from "../tools/moveContentUpOneLevel"
import { execFactory } from "../tools/exec";
import { getIsDryRun } from "../lib/getIsDryRun";
import { crawl } from "../tools/crawl";
import * as fs from "fs";
import * as commentJson from "comment-json";



/** 
 * To disable dry run mode  DRY_RUN=1 env variable must be set.
 * This function Change change the working directory.
 * */
async function run(params: { pathToTargetModule: string; }) {

    const { isDryRun } = getIsDryRun();

    const { exec } = execFactory({ isDryRun });
    const { moveContentUpOneLevel } = moveContentUpOneLevelFactory({ isDryRun });


    process.chdir(params.pathToTargetModule);

    if( fs.existsSync(".npmignore") ){
        throw new Error(".npmignore not supported, please use package.json 'files' instead");
    }

    const packageJsonRaw= 
        fs.readFileSync("package.json")
            .toString("utf8")

    const packageJsonParsed = JSON.parse(
        packageJsonRaw
    );

    const packageJsonFilesResolved: string[] | undefined = await (() => {

        const pathWithWildcards: string[] | undefined =
            packageJsonParsed
                .files
            ;

        if (!pathWithWildcards) {
            return undefined;
        }

        const { globProxy } = globProxyFactory({ "cwdAndRood": "." });


        const flat = [
            (prev: string[], curr: string[]) => [...prev, ...curr], 
            [] as string[]
        ] as const;

        return  Promise.all(
            pathWithWildcards
                .map(pathWithWildcard => globProxy({ pathWithWildcard }))
        ).then(
            arrOfArr => 
                arrOfArr
                    .reduce(...flat)
                    .map(
                        fileOrDirPath => 
                        !fs.lstatSync(fileOrDirPath).isDirectory() ? 
                                [fileOrDirPath]
                                : 
                                crawl(fileOrDirPath)
                                    .map(filePath => path.join(fileOrDirPath, filePath))
                    )
                    .reduce(...flat)
        );


    })();

    const { srcDirPath, denoDistPath, tsconfigOutDir } = fs.existsSync("./mod.ts") ?
        modTsFile.parseMetadata({ "projectPath": "." })
        :
        { // Only so that this script can be used as a standalone ( with module that do not uses denoify )
            "srcDirPath": "./src",
            "denoDistPath": undefined,
            "tsconfigOutDir": commentJson.parse(
                fs.readFileSync("./tsconfig.json")
                    .toString("utf8")
            )["compilerOptions"]["outDir"] as string
        }
        ;


    if (pathDepth(tsconfigOutDir) != 1) {
        throw new Error("For this script to work tsconfig out dir must be a directory at the root of the project");
    }



    if (!!denoDistPath) {

        await exec(`rm -r ${denoDistPath}`);

    }

    const beforeMovedFilePaths = await (async ()=>{

        const moveAndReplace= (dirPath: string)=> moveContentUpOneLevel({ dirPath })
            .then(({ beforeMovedFilePaths }) => beforeMovedFilePaths.map(filePath => path.join(dirPath, filePath)))
            ;

        return [
            ...(await moveAndReplace(tsconfigOutDir)),
            ...(await moveAndReplace(srcDirPath))
        ];


    })();

    console.log(beforeMovedFilePaths);

    
    const getAfterMovedFilePath = (params: { beforeMovedFilePath: string})=> {

        const beforeMovedFilePath = beforeMovedFilePaths.find(
            beforeMovedFilePath => path.relative(
                beforeMovedFilePath, 
                params.beforeMovedFilePath
            ) === ""
        );

        if( beforeMovedFilePath === undefined ){
            return params.beforeMovedFilePath;
        }


        const afterMovedFilePath = beforeMovedFilePath
            .replace(/^\.\//, "")
            .split(path.sep)
            .filter((...[,index])=> index !== 0)
            .join(path.sep)
            ;

        return afterMovedFilePath ;

    };

    beforeMovedFilePaths
        .map(beforeMovedFilePath => getAfterMovedFilePath({ beforeMovedFilePath }))
        .filter(afterMovedFilePath => /\.js\.map$/.test(afterMovedFilePath))
        .forEach(sourceMapFilePath => {

            const sourceMapParsed: { sources: string[] } = JSON.parse(
                fs.readFileSync(sourceMapFilePath)
                    .toString("utf8")
            );

            const sources = sourceMapParsed.sources
                .map(filePath => path.basename(filePath))
                ;

            console.log(`Fixing ${sourceMapFilePath}: ${JSON.stringify({ sources })}`);

            walk: {

                if (isDryRun) {
                    break walk;
                }

                fs.writeFileSync(
                    sourceMapFilePath,
                    Buffer.from(
                        JSON.stringify(
                            {
                                ...sourceMapParsed,
                                sources
                            }
                        )
                        ,
                        "utf8"
                    )
                );

            }

        })
        ;


    {

        const newPackageJsonRaw = JSON.stringify(
            {
                ...packageJsonParsed,
                ...("main" in packageJsonParsed ? {
                    "main": path.relative(
                        tsconfigOutDir,
                        packageJsonParsed.main
                    )
                } : {}),
                ...("types" in packageJsonParsed ? {
                    "types": path.relative(
                        tsconfigOutDir,
                        packageJsonParsed.types
                    )
                } : {}),
                ...("bin" in packageJsonParsed ? {
                    "bin": (() => {

                        const out: Record<string, string> = {};

                        Object.keys(packageJsonParsed.bin)
                            .map(binName => [binName, packageJsonParsed.bin[binName]] as const)
                            .forEach(([binName, beforeMovedBinFilePath]) =>
                                out[binName] = getAfterMovedFilePath({ "beforeMovedFilePath": beforeMovedBinFilePath })
                            )
                            ;

                        return out;

                    })()
                } : {}),
                ...(!!packageJsonFilesResolved ? {
                    "files": (() => {

                        const out = packageJsonFilesResolved
                            .map(beforeMovedFilesFilePath => getAfterMovedFilePath({
                                "beforeMovedFilePath": beforeMovedFilesFilePath
                            }))
                            ;

                        //If corresponding source file is not included do not include source file.
                        {

                            const srcFilePaths = out
                                .filter(filePath => /\.ts$/i.test(filePath))
                                .map(filePath => filePath.replace(/\.ts$/, ".ts"))
                                ;

                            [...out]
                                .filter(filePath => /\.js\.map$/.test(filePath))
                                .filter(filePath => !srcFilePaths.includes(filePath.replace(/\.js\.map$/, ".ts")))
                                .forEach(filePath => out.splice(out.indexOf(filePath), 1))
                                ;

                        }

                        return out;

                    })()
                } : {}),
                "scripts": undefined
            },
            null,
            (packageJsonRaw
                .replace(/\t/g, "    ")
                .match(/^(\s*)\"name\"/m) ?? [{ "length": 2 }])[1].length
        ) + packageJsonRaw.match(/}([\r\n]*)$/)![1];


        console.log(`${isDryRun ? "(dry)" : ""} package.json:\n${newPackageJsonRaw}`);

        walk: {

            if (isDryRun) {
                break walk;
            }


            fs.writeFileSync(
                "package.json",
                Buffer.from(newPackageJsonRaw, "utf8")
            );

        }


    }


}

if (require.main === module) {
    process.once("unhandledRejection", error => { throw error; });
    run({ "pathToTargetModule": "." });
}
