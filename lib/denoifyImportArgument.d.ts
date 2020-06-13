import type { Result as ResolveResult } from "./resolve";
/**
 * examples:
 * "evt" -> "https://deno.land/x/evt@.../mod.ts"
 * "evt/dist/tools/typeSafety" -> "https://deno.land/x/evt@.../deno_dist/tools/typeSafety/index.ts"
 * "./interfaces" -> "./interfaces/index.ts"
 */
export declare function denoifyImportArgumentFactory(params: {
    resolve(params: {
        nodeModuleName: string;
    }): Promise<ResolveResult>;
}): {
    denoifyImportArgument: (params: {
        /** Path of the file in which the import was */
        fileDirPath: string;
        /** e.g:
         * "evt"
         * "evt/dist/tools/typeSafety"
         * "evt/dist/tools/typeSafety/assert"
         * ...
         */
        importArgument: string;
    }) => Promise<string>;
};
