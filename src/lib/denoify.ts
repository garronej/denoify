
import { denoifySingleFileFactory } from "./denoifySingleFile";
import { transformCodebase } from "./transformCodebase";
import { resolveNodeModuleToDenoModuleFactory } from "./resolveNodeModuleToDenoModule";
import * as fs from "fs";
import * as path from "path";
import * as commentJson from "comment-json";
import { denoifyImportExportStatementFactory } from "./denoifyImportExportStatement";
import { isInsideOrIsDir } from "../tools/isInsideOrIsDir";
import { getInstalledVersionPackageJsonFactory } from "./getInstalledVersionPackageJson";
import { toPosix } from "../tools/toPosix"
import * as st from "scripting-tools";

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

    const packageJsonParsed = JSON.parse(
        fs.readFileSync("package.json")
            .toString("utf8")
    );

    let tsconfigOutDir: string | undefined = commentJson.parse(
        fs.readFileSync("tsconfig.json")
            .toString("utf8")
    )["compilerOptions"]["outDir"]; // ./dist

    if (!tsconfigOutDir) {
        throw new Error("tsconfig.json must specify an outDir");
    }

    tsconfigOutDir = path.normalize(tsconfigOutDir);

    if (!("main" in packageJsonParsed)) {
        //TODO: We shouldn't force users to specify a default export.
        throw new Error([
            "A main field in package.json need to be specified",
            "otherwise we don't know what file the mod.ts should export."
        ].join(" "));
    }

    if (
        !isInsideOrIsDir({
            "dirPath": tsconfigOutDir,
            "fileOrDirPath": path.normalize(packageJsonParsed["main"])
        })
    ) {
        throw new Error(`The package.json main should point to a file inside ${tsconfigOutDir}`)
    }

    const { denoifySingleFile } = denoifySingleFileFactory((() => {

        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJsonFactory({
            "projectPath": "."
        });

        const { denoifyImportExportStatement } = denoifyImportExportStatementFactory((() => {

            const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModuleFactory({
                "userProvidedPorts": packageJsonParsed["denoPorts"] ?? {},
                "dependencies": packageJsonParsed["dependencies"] ?? {},
                "devDependencies": packageJsonParsed["devDependencies"] ?? {},
                "log": console.log,
                getInstalledVersionPackageJson
            });

            return {
                resolveNodeModuleToDenoModule,
                "userProvidedReplacerPath": packageJsonParsed["denoifyReplacer"],
                getInstalledVersionPackageJson
            };

        })());

        return { denoifyImportExportStatement };

    })());

    const denoDistPath = path.join(
        path.dirname(tsconfigOutDir),
        `deno_${path.basename(tsconfigOutDir)}`
    ); // ./deno_dist

    await transformCodebase({
        srcDirPath,
        "destDirPath": denoDistPath,
        "transformSourceCodeString": ({ extension, sourceCode, fileDirPath }) => 
            /^(?:ts|tsx|js|jsx)$/i.test(extension) ?
                denoifySingleFile({ sourceCode, fileDirPath })
                :
                Promise.resolve(sourceCode)
    });

    {

        const modFilePath = path.join(denoDistPath, "mod.ts");

        if (!fs.existsSync(modFilePath)) {

            fs.writeFileSync(
                path.join(modFilePath),
                Buffer.from(
                    `export * from "${toPosix(
                        path.relative(
                            tsconfigOutDir,
                            path.normalize(packageJsonParsed["main"]) // ./dist/lib/index.js
                        ) // ./lib/index.js
                            .replace(/\.js$/i, ".ts"), // ./deno_dist/lib/index.ts
                    ).replace(/^(:?\.\/)?/, "./")}";`,
                    "utf8"
                )
            );

        }

    }

    if (fs.existsSync("README.md")) {

        st.fs_move("COPY", ".", denoDistPath, "README.md");

    }


    console.log(`Publishing on https://deno.land/x use subdirectory: ${denoDistPath} when asked`);

}

