"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const addCache_1 = require("../tools/addCache");
const replaceAsync_1 = require("../tools/replaceAsync");
function commonJsImportStringToDenoImportStringFactory(params) {
    const getDenoDependency = addCache_1.addCache(params.getDenoDependency);
    async function commonJsImportStringToDenoImportString(importStr) {
        if (importStr.startsWith(".")) {
            if (/\.json$/i.test(importStr)) {
                return importStr;
            }
            return `${importStr}.ts`;
        }
        const [moduleName, ...rest] = importStr.split("/");
        const { url, main } = await getDenoDependency(moduleName);
        return path.join(...[
            path.join(url, rest.length === 0 ? main : ""),
            ...rest.map((...[, index]) => index === rest.length - 1 ?
                rest[index] + ".ts" : rest[index])
        ]);
    }
    return { commonJsImportStringToDenoImportString };
}
function denoifySourceCodeStringFactory(params) {
    const { commonJsImportStringToDenoImportString } = commonJsImportStringToDenoImportStringFactory(params);
    /** Returns source code with deno imports replaced */
    async function denoifySourceCodeString(params) {
        const { sourceCode } = params;
        let out = sourceCode;
        for (const quoteSymbol of [`"`, `'`]) {
            const strRegExpInQuote = `${quoteSymbol}[^${quoteSymbol}]+${quoteSymbol}`;
            const replacerAsync = (() => {
                const regExpReplaceInQuote = new RegExp(`^([^${quoteSymbol}]*${quoteSymbol})([^${quoteSymbol}]+)(${quoteSymbol}[^${quoteSymbol}]*)$`, "m");
                return async (substring) => {
                    const [, before, importStr, after] = substring.match(regExpReplaceInQuote);
                    return `${before}${await commonJsImportStringToDenoImportString(importStr)}${after}`;
                };
            })();
            for (const regExpStr of [
                `import\\s+\\*\\s+as\\s+[^\\s]+\\s+from\\s+${strRegExpInQuote}`,
                `import\\s*\\{[^\\}]*}\\s*from\\s*${strRegExpInQuote}`,
                `import\\s*${strRegExpInQuote}`,
                `[^a-zA-Z\._0-9$]import\\s*\\(\\s*${strRegExpInQuote}\\s*\\)`
            ]) {
                out = await replaceAsync_1.replaceAsync(out, new RegExp(regExpStr, "mg"), replacerAsync);
            }
        }
        return out;
    }
    return { denoifySourceCodeString };
}
exports.denoifySourceCodeStringFactory = denoifySourceCodeStringFactory;
