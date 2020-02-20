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
function makeStatic(f) {
    const previousResults = new Map();
    return (function callee(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = JSON.stringify(args);
            if (previousResults.has(key)) {
                return previousResults.get(key);
            }
            previousResults.set(key, yield f(...args));
            return callee(...args);
        });
    });
}
function toDenoImportFactory(params) {
    const getDenoModuleStatic = makeStatic(params.getDenoModuleRepo);
    function toDenoImport(importStr) {
        return __awaiter(this, void 0, void 0, function* () {
            if (importStr.startsWith(".")) {
                if (/\.json$/i.test(importStr)) {
                    return importStr;
                }
                return `${importStr}.ts`;
            }
            const [moduleName, ...rest] = importStr.split("/");
            const { url, main } = yield getDenoModuleStatic(moduleName);
            return path.join(...[
                path.join(url, rest.length === 0 ? main : ""),
                ...rest.map((...[, index]) => index === rest.length - 1 ?
                    rest[index] + ".ts" : rest[index])
            ]);
        });
    }
    return { toDenoImport };
}
function replaceAsync(str, regex, replacerAsync) {
    return __awaiter(this, void 0, void 0, function* () {
        const promises = [];
        str.replace(regex, (match, ...args) => {
            const promise = replacerAsync(match, ...args);
            promises.push(promise);
            return "";
        });
        const data = yield Promise.all(promises);
        return str.replace(regex, () => data.shift());
    });
}
function replaceImportsFactory(params) {
    const { getDenoModuleRepo } = params;
    const { toDenoImport } = toDenoImportFactory({ getDenoModuleRepo });
    /** Returns source code with deno imports replaced */
    function replaceImports(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { sourceCode } = params;
            let out = sourceCode;
            for (const quoteSymbol of [`"`, `'`]) {
                const strRegExpInQuote = `${quoteSymbol}[^${quoteSymbol}]+${quoteSymbol}`;
                //TODO: Remove 
                const strRegExpEnd = `${strRegExpInQuote}\\s*;?`;
                const replacerAsync = (() => {
                    const regExpReplaceInQuote = new RegExp(`^([^${quoteSymbol}]*${quoteSymbol})([^${quoteSymbol}]+)(${quoteSymbol}[^${quoteSymbol}]*)$`, "m");
                    return (substring) => __awaiter(this, void 0, void 0, function* () {
                        const [, before, importStr, after] = substring.match(regExpReplaceInQuote);
                        return `${before}${yield toDenoImport(importStr)}${after}`;
                    });
                })();
                for (const regExpStr of [
                    `import\\s+\\*\\s+as\\s+[^\\s]+\\s+from\\s+${strRegExpEnd}`,
                    `import\\s*\\{[^\\}]*}\\s*from\\s*${strRegExpEnd}`,
                    `import\\s*${strRegExpEnd}`,
                    ...["import", "require"].map(keyword => `[^a-zA-Z\._0-9$]${keyword}\\s*\\(\\s*${strRegExpInQuote}\\s*\\)`)
                ]) {
                    out = yield replaceAsync(out, new RegExp(regExpStr, "mg"), replacerAsync);
                }
            }
            return out;
        });
    }
    return { replaceImports };
}
exports.replaceImportsFactory = replaceImportsFactory;
