import * as path from "path";
import * as fs from "fs";
import type { NodeToDenoModuleResolutionResult } from "./resolveNodeModuleToDenoModule";
import { ParsedImportExportStatement } from "./types/ParsedImportExportStatement";

/**
 * examples: 
 * import { Evt } from "evt" -> import { Evt } from "https://deno.land/x/evt@.../mod.ts"
 * import { id } "evt/dist/tools/typeSafety" -> "https://deno.land/x/evt@.../deno_dist/tools/typeSafety/index.ts"
 * import * as interfaces from "./interfaces" -> import * as interfaces from "./interfaces/index.ts"
 */
export function denoifyImportExportStatementFactory(
    params: {
        resolveNodeModuleToDenoModule(params: { nodeModuleName: string; }): Promise<NodeToDenoModuleResolutionResult>;
    }
) {

    const { resolveNodeModuleToDenoModule } = params;

    async function denoifyImportExportStatement(
        params: {
            /** Path of the file in which the import was */
            fileDirPath: string; //
            /** e.g:  
             * import { Evt } from "evt"
             * import { id } "evt/dist/tools/typeSafety" 
             * import * as interfaces from "./interfaces"
             * ... 
             */
            importExportStatement: string;
        }
    ): Promise<string> {


        const { fileDirPath } = params;

        const parsedImportExportStatement = ParsedImportExportStatement.parse(
            params.importExportStatement
        );

        const stringify = (argument: string) =>
            ParsedImportExportStatement.stringify({
                ...parsedImportExportStatement,
                argument
            });

        const importStr = parsedImportExportStatement
            .argument // ./interfaces/ 
            .replace(/\/+$/, "/index") // ./interfaces/index ( if ends with / append index )
            ;

        if (importStr.startsWith(".")) {

            if (/\.json$/i.test(importStr)) {
                return stringify(importStr);
            }

            if (fs.existsSync(path.join(fileDirPath, `${importStr}.ts`))) {
                return stringify(`${importStr}.ts`);
            }

            const out = path.posix.join(importStr, "index.ts");

            return stringify(out.startsWith(".") ? out : `./${out}`);

        }

        const { nodeModuleName, specificImportPath } = (() => {

            const [nodeModuleName, ...rest] = importStr.split("/");

            return {
                nodeModuleName,
                "specificImportPath": rest.join("/")
            };


        })();


        const nodeToDenoModuleResolutionResult = await resolveNodeModuleToDenoModule({ nodeModuleName });

        if (nodeToDenoModuleResolutionResult.result === "NON-FATAL UNMET DEPENDENCY") {
            return stringify(`${importStr} DENOIFY: DEPENDENCY UNMET (${nodeToDenoModuleResolutionResult.kind})`);
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