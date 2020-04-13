"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const addCache_1 = require("../tools/addCache");
const replaceAsync_1 = require("../tools/replaceAsync");
const fs = require("fs");
const node_fetch_1 = require("node-fetch");
const urlJoin = require("url-join");
function commonJsImportStringToDenoImportStringFactory(params) {
    const resolve = addCache_1.addCache(params.resolve);
    async function commonJsImportStringToDenoImportString(params) {
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
            const out = path.join(importStr, "index.ts");
            return out.startsWith(".") ? out : `./${out}`;
        }
        const [nodeModuleName, ...rest] = importStr.split("/");
        const resolveResult = await resolve({ nodeModuleName });
        if (resolveResult.type === "UNMET DEV DEPENDENCY") {
            return `${importStr} (unmet dev dependency)`;
        }
        if (resolveResult.type === "PORT") {
            //TODO: crawl
            if (rest.length !== 0) {
                throw new Error(`Error with: ${importStr} Port support ony default import`);
            }
            return resolveResult.url;
        }
        const { url, // https://deno.land/x/event_emitter/
        tsconfigOutDir, } = resolveResult;
        const denoDistPath = path.join(path.dirname(tsconfigOutDir), `deno_${path.basename(tsconfigOutDir)}`); // deno_dist
        if (rest.length === 0) {
            return urlJoin(url, "mod.ts");
        }
        const out = urlJoin(url, path.join(denoDistPath, path.relative(tsconfigOutDir, path.join(...rest) // dest/tools/typeSafety
        ) //  tools/typeSafety
        ) // deno_dist/tool/typeSafety
            + ".ts" // deno_dist/tool/typeSafety.ts
        ) // https://deno.land/x/event_emitter/deno_dist/tool/typeSafety.ts
        ;
        const is404 = await node_fetch_1.default(out)
            .then(({ status }) => status === 404);
        if (is404) {
            return out
                .replace(/\.ts$/, "/index.ts");
        }
        return out;
    }
    return { commonJsImportStringToDenoImportString };
}
function denoifySourceCodeStringFactory(params) {
    const { commonJsImportStringToDenoImportString } = commonJsImportStringToDenoImportStringFactory(params);
    /** Returns source code with deno imports replaced */
    async function denoifySourceCodeString(params) {
        const { fileDirPath, sourceCode } = params;
        let out = sourceCode;
        for (const quoteSymbol of [`"`, `'`]) {
            const strRegExpInQuote = `${quoteSymbol}[^${quoteSymbol}]+${quoteSymbol}`;
            const replacerAsync = (() => {
                const regExpReplaceInQuote = new RegExp(`^([^${quoteSymbol}]*${quoteSymbol})([^${quoteSymbol}]+)(${quoteSymbol}[^${quoteSymbol}]*)$`, "m");
                return async (substring) => {
                    const [, before, importStr, after] = substring.match(regExpReplaceInQuote);
                    return `${before}${await commonJsImportStringToDenoImportString({ fileDirPath, importStr })}${after}`;
                };
            })();
            for (const regExpStr of [
                `export\\s+\\*\\s+from\\s*${strRegExpInQuote}`,
                `(?:import|export)(?:\\s+type)?\\s*\\*\\s*as\\s+[^\\s]+\\s+from\\s*${strRegExpInQuote}`,
                `(?:import|export)(?:\\s+type)?\\s*{[^}]*}\\s*from\\s*${strRegExpInQuote}`,
                `import(?:\\s+type)?\\s+[^\\*{][^\\s]*\\s+from\\s*${strRegExpInQuote}`,
                `import\\s*${strRegExpInQuote}`,
                `[^a-zA-Z\._0-9$]import\\s*\\(\\s*${strRegExpInQuote}\\s*\\)`,
            ]) {
                out = await replaceAsync_1.replaceAsync(out, new RegExp(regExpStr, "mg"), replacerAsync);
            }
        }
        return out;
    }
    return { denoifySourceCodeString };
}
exports.denoifySourceCodeStringFactory = denoifySourceCodeStringFactory;
