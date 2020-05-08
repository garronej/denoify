"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const replaceAsync_1 = require("../tools/replaceAsync");
function denoifySingleFileFactory(params) {
    const { denoifyImportArgument } = params;
    /** Returns source code with deno imports replaced */
    async function denoifySingleFile(params) {
        const { fileDirPath, sourceCode } = params;
        let out = sourceCode;
        for (const quoteSymbol of [`"`, `'`]) {
            const strRegExpInQuote = `${quoteSymbol}[^${quoteSymbol}]+${quoteSymbol}`;
            const replacerAsync = (() => {
                const regExpReplaceInQuote = new RegExp(`^([^${quoteSymbol}]*${quoteSymbol})([^${quoteSymbol}]+)(${quoteSymbol}[^${quoteSymbol}]*)$`, "m");
                return async (substring) => {
                    const [, before, importArgument, after] = substring.match(regExpReplaceInQuote);
                    return `${before}${await denoifyImportArgument({ fileDirPath, importArgument })}${after}`;
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
    return { denoifySingleFile };
}
exports.denoifySingleFileFactory = denoifySingleFileFactory;
