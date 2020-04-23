
import * as path from "path";
import { addCache } from "../tools/addCache";
import { Scheme } from "./Scheme";
import * as fs from "fs";
import { is404 } from "../tools/is404";
import type { Result as ResolveResult } from "./resolve";

/**
 * examples: 
 * "evt" -> "https://deno.land/x/evt@.../mod.ts"
 * "" -> "https://deno.land/x/evt@.../mod.ts"
 * "./interfaces" -> "./interfaces/index.ts"
 */
export function denoifyImportArgumentFactory(
    params: {
        resolve(params: { nodeModuleName: string; }): Promise<ResolveResult>;
    }
) {

    const resolve = addCache(params.resolve);

    async function denoifyImportArgument(
        params: {
            /** Path of the file in which the import was */
            fileDirPath: string; //
            /** e.g:  
             * "evt" 
             * "evt/dist/tools/typeSafety" 
             * "evt/dist/tools/typeSafety/assert"
             * ... 
             */
            importArgument: string;
        }
    ): Promise<string> {

        const { fileDirPath } = params;
        const importStr = params
            .importArgument // ./interfaces/
            .replace(/\/+$/, "/index") // ./interfaces/index
            ;

        if (importStr.startsWith(".")) {

            if (/\.json$/i.test(importStr)) {
                return importStr;
            }

            if (fs.existsSync(path.join(fileDirPath, `${importStr}.ts`))) {
                return `${importStr}.ts`;
            }

            const out = path.join(importStr, "index.ts");

            return out.startsWith(".") ? out : `./${out}`;

        }

        const [nodeModuleName, ...rest] = importStr.split("/");

        const resolveResult = await resolve({ nodeModuleName });

        if (resolveResult.type === "NON-FATAL UNMET DEPENDENCY") {
            return `${importStr} DENOIFY: DEPENDENCY UNMET (${resolveResult.kind})`
        }


        if (resolveResult.type === "HANDMADE PORT") {

            //TODO: crawl
            if (rest.length !== 0) {
                throw new Error(`Error with: ${importStr} Port support ony default import`);
            }

            return Scheme.buildUrl(resolveResult.scheme, {});

        }


        const { scheme, tsconfigOutDir } = resolveResult;


        if (rest.length === 0) {
            return Scheme.buildUrl(scheme, {});
        }

        let pathToFile = path.join(
            path.join(
                path.dirname(tsconfigOutDir), // .
                `deno_${path.basename(tsconfigOutDir)}`//deno_dist
            ), // deno_dist
            path.relative(
                tsconfigOutDir,
                path.join(...rest) // dest/tools/typeSafety
            ) //  tools/typeSafety
        ) // deno_dist/tool/typeSafety
            + ".ts" // deno_dist/tool/typeSafety.ts

        let out = Scheme.buildUrl(
            scheme,
            { pathToFile }
        );

        if (await is404(out)) {

            out = out
                .replace(/\.ts$/, "/index.ts")
                // https://.../deno_dist/tool/typeSafety/index.ts
                ;

            if (await is404(out)) {
                throw new Error(`Problem resolving ${importStr} in ${fileDirPath} with ${JSON.stringify(scheme)} 404 not found.`);
            }

        }

        return out;


    }

    return { denoifyImportArgument };

}