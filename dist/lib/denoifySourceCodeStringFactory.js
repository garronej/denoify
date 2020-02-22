"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const addCache_1 = require("../tools/addCache");
const replaceAsync_1 = require("../tools/replaceAsync");
function commonJsImportStringToDenoImportStringFactory(params) {
    const getDenoDependency = addCache_1.addCache(params.getDenoDependency);
    function commonJsImportStringToDenoImportString(importStr) {
        return __awaiter(this, void 0, void 0, function* () {
            if (importStr.startsWith(".")) {
                if (/\.json$/i.test(importStr)) {
                    return importStr;
                }
                return `${importStr}.ts`;
            }
            const [moduleName, ...rest] = importStr.split("/");
            const { url, main } = yield getDenoDependency(moduleName);
            return path.join(...[
                path.join(url, rest.length === 0 ? main : ""),
                ...rest.map((...[, index]) => index === rest.length - 1 ?
                    rest[index] + ".ts" : rest[index])
            ]);
        });
    }
    return { commonJsImportStringToDenoImportString };
}
function denoifySourceCodeStringFactory(params) {
    const { commonJsImportStringToDenoImportString } = commonJsImportStringToDenoImportStringFactory(params);
    /** Returns source code with deno imports replaced */
    function denoifySourceCodeString(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { sourceCode } = params;
            let out = sourceCode;
            for (const quoteSymbol of [`"`, `'`]) {
                const strRegExpInQuote = `${quoteSymbol}[^${quoteSymbol}]+${quoteSymbol}`;
                const replacerAsync = (() => {
                    const regExpReplaceInQuote = new RegExp(`^([^${quoteSymbol}]*${quoteSymbol})([^${quoteSymbol}]+)(${quoteSymbol}[^${quoteSymbol}]*)$`, "m");
                    return (substring) => __awaiter(this, void 0, void 0, function* () {
                        const [, before, importStr, after] = substring.match(regExpReplaceInQuote);
                        return `${before}${yield commonJsImportStringToDenoImportString(importStr)}${after}`;
                    });
                })();
                for (const regExpStr of [
                    `import\\s+\\*\\s+as\\s+[^\\s]+\\s+from\\s+${strRegExpInQuote}`,
                    `import\\s*\\{[^\\}]*}\\s*from\\s*${strRegExpInQuote}`,
                    `import\\s*${strRegExpInQuote}`,
                    `[^a-zA-Z\._0-9$]import\\s*\\(\\s*${strRegExpInQuote}\\s*\\)`
                ]) {
                    out = yield replaceAsync_1.replaceAsync(out, new RegExp(regExpStr, "mg"), replacerAsync);
                }
            }
            return out;
        });
    }
    return { denoifySourceCodeString };
}
exports.denoifySourceCodeStringFactory = denoifySourceCodeStringFactory;
