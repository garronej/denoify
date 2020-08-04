import * as path from "path";
import { assert, typeGuard } from "evt/tools/typeSafety";
import * as fs from "fs";
import type { resolveNodeModuleToDenoModuleFactory } from "./resolveNodeModuleToDenoModule";
import type { getInstalledVersionPackageJsonFactory } from "./getInstalledVersionPackageJson";
import { ParsedImportExportStatement } from "./types/ParsedImportExportStatement";
import { consumeExecutableReplacerFactory } from "./replacer";

/**
 * examples: 
 * import { Evt } from "evt" -> import { Evt } from "https://deno.land/x/evt@.../mod.ts"
 * import { id } "evt/dist/tools/typeSafety" -> "https://deno.land/x/evt@.../deno_dist/tools/typeSafety/index.ts"
 * import * as interfaces from "./interfaces" -> import * as interfaces from "./interfaces/index.ts"
 */
export function denoifyImportExportStatementFactory(
    params: {
        userProvidedReplacerPath: string | undefined;
    } &
        ReturnType<typeof resolveNodeModuleToDenoModuleFactory> &
        ReturnType<typeof getInstalledVersionPackageJsonFactory>
) {

    const {
        userProvidedReplacerPath,
        resolveNodeModuleToDenoModule,
        getInstalledVersionPackageJson
    } = params;

    const {
        consumeExecutableReplacer: consumeExecutableBuiltinsReplacer
    } = consumeExecutableReplacerFactory({
        "filePath": path.join(__dirname, "..", "bin", "replacer", "index")
    });

    const {
        consumeExecutableReplacer: consumeExecutableUserProvidedReplacer
    } = userProvidedReplacerPath === undefined ?
            { "consumeExecutableReplacer": undefined } :
            consumeExecutableReplacerFactory({
                "filePath": userProvidedReplacerPath
            });

    async function denoifyImportExportStatement(
        params: {
            /** Path of the file in which the import was */
            fileDirPath: string;
            /** e.g:  
             * import { Evt } from "evt"
             * import { id } "evt/dist/tools/typeSafety" 
             * import * as interfaces from "./interfaces"
             * ... 
             */
            importExportStatement: string;
        }
    ): Promise<string> {


        const { fileDirPath, importExportStatement } = params;

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

            if (fs.existsSync(path.join(fileDirPath, `${relativePath}.ts`))) {
                return stringify(`${relativePath}.ts`);
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

        for(const consumeExecutableReplacer of [
            consumeExecutableUserProvidedReplacer, 
            consumeExecutableBuiltinsReplacer
        ]) {

            const result = await consumeExecutableReplacer?.({
                parsedImportExportStatement,
                version
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