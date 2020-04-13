
import * as path from "path";
import { addCache } from "../tools/addCache";
import { replaceAsync } from "../tools/replaceAsync";
import type { ResolveResult } from "./resolve";
import * as fs from "fs";
import fetch from "node-fetch";
const urlJoin = require("url-join");


function commonJsImportStringToDenoImportStringFactory(
    params: {
        resolve(params: { nodeModuleName: string; }): Promise<ResolveResult>;
    }
) {

    const resolve = addCache(params.resolve);

    async function commonJsImportStringToDenoImportString(
        params: { 
            /** Path of the file in which the import was */
            fileDirPath: string; //
            /** e.g:  
             * "evt" 
             * "evt/dist/tools/typeSafety" 
             * "evt/dist/tools/typeSafety/assert"
             * ... 
             */
            importStr: string; 
        }
    ): Promise<string> {

        const { fileDirPath } = params;
        const importStr = params
            .importStr // ./interfaces/
            .replace(/\/+$/, "/index") // ./interfaces/index
            ; 

        if (importStr.startsWith(".")) {

            if (/\.json$/i.test(importStr)) {
                return importStr;
            }

            if (fs.existsSync(path.join(fileDirPath, `${importStr}.ts`))) {
                return `${importStr}.ts`;
            }

            const out= path.join(importStr, "index.ts");

            return out.startsWith(".") ? out : `./${out}`;

        }

        const [nodeModuleName, ...rest] = importStr.split("/");

        const resolveResult = await resolve({ nodeModuleName });

        if( resolveResult.type === "UNMET DEV DEPENDENCY" ){
            return `${importStr} (unmet dev dependency)`;
        }

        if( resolveResult.type === "PORT" ){

            //TODO: crawl
            if (rest.length !== 0) {
                throw new Error(`Error with: ${importStr} Port support ony default import`);
            }

            return resolveResult.url;

        }

        const { 
            url, // https://deno.land/x/event_emitter/
            tsconfigOutDir, // ./dist
        } = resolveResult;

        const denoDistPath = path.join(
            path.dirname(tsconfigOutDir),
            `deno_${path.basename(tsconfigOutDir)}`
        ); // deno_dist

        if (rest.length === 0) {

            return urlJoin(url, "mod.ts");


        }

        const out = urlJoin(
            url,
            path.join(
                denoDistPath,
                path.relative(
                    tsconfigOutDir,
                    path.join(...rest) // dest/tools/typeSafety
                ) //  tools/typeSafety
            ) // deno_dist/tool/typeSafety
            + ".ts" // deno_dist/tool/typeSafety.ts
        ) // https://deno.land/x/event_emitter/deno_dist/tool/typeSafety.ts
            ;

        const is404 = await fetch(out)
            .then(({ status }) => status === 404)
            ;

        if (is404) {
            return out
                .replace(/\.ts$/, "/index.ts")
                // https://deno.land/x/event_emitter/deno_dist/tool/typeSafety/index.ts
                ;
        }

        return out;

    }

    return { commonJsImportStringToDenoImportString };

}

export function denoifySourceCodeStringFactory(
    params: {
        resolve(params: { nodeModuleName: string; }): Promise<ResolveResult>;
    }
) {

    const { commonJsImportStringToDenoImportString } =
        commonJsImportStringToDenoImportStringFactory(params);

    /** Returns source code with deno imports replaced */
    async function denoifySourceCodeString(
        params: {
            fileDirPath: string;
            sourceCode: string;
        }
    ): Promise<string> {

        const { fileDirPath, sourceCode } = params;

        let out = sourceCode;

        for (const quoteSymbol of [`"`, `'`]) {

            const strRegExpInQuote = `${quoteSymbol}[^${quoteSymbol}]+${quoteSymbol}`;

            const replacerAsync = (() => {

                const regExpReplaceInQuote = new RegExp(
                    `^([^${quoteSymbol}]*${quoteSymbol})([^${quoteSymbol}]+)(${quoteSymbol}[^${quoteSymbol}]*)$`,
                    "m"
                );

                return async (substring: string) => {

                    const [, before, importStr, after] = substring.match(regExpReplaceInQuote)!;

                    return `${before}${await commonJsImportStringToDenoImportString({ fileDirPath, importStr })}${after}`;

                };

            })();

            for (const regExpStr of [
                `export\\s+\\*\\s+from\\s*${strRegExpInQuote}`, //export * from "..."
                `(?:import|export)(?:\\s+type)?\\s*\\*\\s*as\\s+[^\\s]+\\s+from\\s*${strRegExpInQuote}`, //import/export [type] * as ns from "..."
                `(?:import|export)(?:\\s+type)?\\s*{[^}]*}\\s*from\\s*${strRegExpInQuote}`, //import/export [type] { Cat } from "..."
                `import(?:\\s+type)?\\s+[^\\*{][^\\s]*\\s+from\\s*${strRegExpInQuote}`, //import [type] Foo from "..."
                `import\\s*${strRegExpInQuote}`, //import "..."
                `[^a-zA-Z\._0-9$]import\\s*\\(\\s*${strRegExpInQuote}\\s*\\)`, //type Foo = import("...").Foo
            ]) {

                out = await replaceAsync(
                    out,
                    new RegExp(regExpStr, "mg"),
                    replacerAsync
                );

            }

        }

        return out;

    }


    return { denoifySourceCodeString };


}





