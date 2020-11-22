import type { resolveNodeModuleToDenoModuleFactory } from "./resolveNodeModuleToDenoModule";
import type { getInstalledVersionPackageJsonFactory } from "./getInstalledVersionPackageJson";
/**
 * examples:
 * import { Evt } from "evt" -> import { Evt } from "https://deno.land/x/evt@.../mod.ts"
 * import { id } "evt/dist/tools/typeSafety" -> "https://deno.land/x/evt@.../deno_dist/tools/typeSafety/index.ts"
 * import * as interfaces from "./interfaces" -> import * as interfaces from "./interfaces/index.ts"
 */
export declare function denoifyImportExportStatementFactory(params: {
    userProvidedReplacerPath: string | undefined;
    getDestDirPath(params: {
        dirPath: string;
    }): string;
} & ReturnType<typeof resolveNodeModuleToDenoModuleFactory> & ReturnType<typeof getInstalledVersionPackageJsonFactory>): {
    denoifyImportExportStatement: (params: {
        /** Path of the file in which the import was */
        dirPath: string;
        /** e.g:
         * import { Evt } from "evt"
         * import { id } "evt/dist/tools/typeSafety"
         * import * as interfaces from "./interfaces"
         * ...
         */
        importExportStatement: string;
    }) => Promise<string>;
};
