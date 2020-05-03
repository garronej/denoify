
import { denoifySingleFileFactory } from "./denoifySingleFile";
import { transformCodebase } from "./transformCodebase";
import { resolveFactory } from "./resolve";
import * as fs from "fs";
import * as path from "path";
import * as commentJson from "comment-json";
import { denoifyImportArgumentFactory } from "./denoifyImportArgument";
import { modTsFile } from "./modTsFile";
import { isInsideOrIsDir } from "../tools/isInsideOrIsDir";

export async function denoify(
    params: {
        projectPath: string;
        srcDirPath?: string;
    }
) {

    process.chdir(params.projectPath ?? ".");

    const srcDirPath = !!params.srcDirPath ?
        params.srcDirPath :
        ["src", "lib"].find(sourceDirPath => fs.existsSync(sourceDirPath))
        ;

    if (!srcDirPath) {
        throw new Error("No src directory found");
    }

    const packageJsonParsed = require(path.join(process.cwd(), "package.json"));

    const tsconfigOutDir: string | undefined = commentJson.parse(
        fs.readFileSync("./tsconfig.json")
            .toString("utf8")
    )["compilerOptions"]["outDir"]; // ./dist

    if (!tsconfigOutDir) {
        throw new Error("tsconfig.json must specify an outDir");
    }

    if( 
        !isInsideOrIsDir({ 
            "dirPath": tsconfigOutDir, 
            "fileOrDirPath": packageJsonParsed.main 
        })
    ) {
        throw new Error(`The package.json main should point to a file inside ${tsconfigOutDir}`) 
    }

    const { denoifySingleFile } = denoifySingleFileFactory((() => {

        const { denoifyImportArgument } = denoifyImportArgumentFactory((() => {

            const { resolve } = resolveFactory({
                "projectPath": ".",
                "userProvidedPorts": packageJsonParsed["denoPorts"] ?? {},
                "dependencies": packageJsonParsed["dependencies"] ?? {},
                "devDependencies": packageJsonParsed["devDependencies"] ?? {},
                "log": console.log
            });

            return { resolve };


        })());

        return { denoifyImportArgument };

    })());




    const denoDistPath = path.join(
        path.dirname(tsconfigOutDir),
        `deno_${path.basename(tsconfigOutDir)}`
    ); // ./deno_dist

    await transformCodebase({
        srcDirPath,
        "destDirPath": denoDistPath,
        "transformSourceCodeString": ({ extension, sourceCode, fileDirPath }) =>
            /^\.?ts$/i.test(extension) || /^\.?js$/i.test(extension) ?
                denoifySingleFile({ sourceCode, fileDirPath })
                :
                Promise.resolve(sourceCode)
    });

    modTsFile.create({
        "projectPath": ".",
        "tsFilePath": path.join(
            denoDistPath,
            path.relative(
                tsconfigOutDir,
                packageJsonParsed.main // ./dist/lib/index.js
            ) // ./lib/index.js
        ) // ./deno_dist/lib/index.js
            .replace(/\.js$/i, ".ts"), // ./deno_dist/lib/index.ts,
        "metadata": { srcDirPath, denoDistPath, tsconfigOutDir },
        "isDryRun": false
    });


}

