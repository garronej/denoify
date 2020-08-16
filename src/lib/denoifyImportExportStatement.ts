import * as path from "path";
import { assert, typeGuard } from "evt/tools/typeSafety";
import * as fs from "fs";
import type { resolveNodeModuleToDenoModuleFactory } from "./resolveNodeModuleToDenoModule";
import type { getInstalledVersionPackageJsonFactory } from "./getInstalledVersionPackageJson";
import { ParsedImportExportStatement } from "./types/ParsedImportExportStatement";
import { consumeExecutableReplacerFactory } from "./replacer";
import { getProjectRoot } from "../tools/getProjectRoot";

/**
 * examples: 
 * import { Evt } from "evt" -> import { Evt } from "https://deno.land/x/evt@.../mod.ts"
 * import { id } "evt/dist/tools/typeSafety" -> "https://deno.land/x/evt@.../deno_dist/tools/typeSafety/index.ts"
 * import * as interfaces from "./interfaces" -> import * as interfaces from "./interfaces/index.ts"
 */
export function denoifyImportExportStatementFactory(
    params: {
        userProvidedReplacerPath: string | undefined;
        getDestDirPath(params: {dirPath: string; }): string;
    } &
        ReturnType<typeof resolveNodeModuleToDenoModuleFactory> &
        ReturnType<typeof getInstalledVersionPackageJsonFactory>
) {

    const {
        userProvidedReplacerPath,
        getDestDirPath,
        resolveNodeModuleToDenoModule,
        getInstalledVersionPackageJson
    } = params;

    const {
        consumeExecutableReplacer: consumeExecutableBuiltinsReplacer
    } = consumeExecutableReplacerFactory({
        "executableFilePath":
            path.join(
                getProjectRoot(),
                fs.existsSync(path.join(getProjectRoot(), "dist")) ? "dist" : "",
                "bin", "replacer", "index.js"
            )
    });

    const {
        consumeExecutableReplacer: consumeExecutableUserProvidedReplacer
    } = userProvidedReplacerPath === undefined ?
            { "consumeExecutableReplacer": undefined } :
            consumeExecutableReplacerFactory({
                "executableFilePath": userProvidedReplacerPath
            });

    async function denoifyImportExportStatement(
        params: {
            /** Path of the file in which the import was */
            dirPath: string;
            /** e.g:  
             * import { Evt } from "evt"
             * import { id } "evt/dist/tools/typeSafety" 
             * import * as interfaces from "./interfaces"
             * ... 
             */
            importExportStatement: string;
        }
    ): Promise<string> {


        const { dirPath, importExportStatement } = params;

        const parsedImportExportStatement = ParsedImportExportStatement.parse(
            params.importExportStatement
        );

        if (parsedImportExportStatement.parsedArgument.type === "URL") {

            //There is no reason to have url import in the source
            //file as url import are not supported by node it does not 
            //hurt to leave the import unchanged. See #7
            return importExportStatement;

        }

        const stringify = (argument: string) =>
            ParsedImportExportStatement.stringify({
                ...parsedImportExportStatement,
                "parsedArgument": ParsedImportExportStatement.ParsedArgument.parse(
                    argument
                )
            });

        if (parsedImportExportStatement.parsedArgument.type === "PROJECT LOCAL FILE") {

            const { relativePath } = parsedImportExportStatement.parsedArgument;

            if (/\.json$/i.test(relativePath)) {
                return stringify(relativePath);
            }

            for (const ext of ["ts", "tsx"]) {
                if (fs.existsSync(path.join(dirPath, `${relativePath}.${ext}`))) {
                    return stringify(`${relativePath}.${ext}`);
                }
            }

            const out = path.posix.join(relativePath, "index.ts");

            return stringify(out.startsWith(".") ? out : `./${out}`);

        }

        //NOTE: Should be inferable...
        assert(
            typeGuard<import("./replacer").ParsedImportExportStatement<"DEPENDENCY">>(
                parsedImportExportStatement
            )
        );

        const { nodeModuleName, specificImportPath } = parsedImportExportStatement.parsedArgument;

        const { version } = await getInstalledVersionPackageJson({ nodeModuleName })
            .catch(() => ({ "version": "0.0.0" }));

        for (const consumeExecutableReplacer of [
            consumeExecutableUserProvidedReplacer,
            consumeExecutableBuiltinsReplacer
        ]) {

            const result = await consumeExecutableReplacer?.({
                parsedImportExportStatement,
                version,
                "destDirPath": getDestDirPath({ dirPath })
            });

            if (result === undefined) {

                continue;

            }

            return result;

        }

        const nodeToDenoModuleResolutionResult = await resolveNodeModuleToDenoModule({ nodeModuleName });

        if (nodeToDenoModuleResolutionResult.result === "NON-FATAL UNMET DEPENDENCY") {
            return stringify(`${
                ParsedImportExportStatement.ParsedArgument.stringify(
                    parsedImportExportStatement.parsedArgument
                )
                } DENOIFY: DEPENDENCY UNMET (${nodeToDenoModuleResolutionResult.kind})`);
        }

        const { getValidImportUrl } = nodeToDenoModuleResolutionResult;

        return stringify(
            await getValidImportUrl(
                !specificImportPath ?
                    ({ "target": "DEFAULT EXPORT" }) :
                    ({ "target": "SPECIFIC FILE", specificImportPath })
            )
        );

    }

    return { denoifyImportExportStatement };

}