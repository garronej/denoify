"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const replaceAsync_1 = require("../tools/replaceAsync");
function denoifySingleFileFactory(params) {
    const { denoifyImportArgument } = params;
    /** Returns source code with deno imports replaced */
    async function denoifySingleFile(params) {
        const { fileDirPath, sourceCode } = params;
        let modifiedSourceCode = sourceCode;
        if (usesBuiltIn("__filename", sourceCode)) {
            modifiedSourceCode = [
                `const __filename = (()=>{`,
                `    const {url: urlStr}= import.meta;`,
                `    const url= new URL(urlStr);`,
                `    return url.protocol === "file:" ? url.pathname : urlStr;`,
                `})();`,
                '',
                modifiedSourceCode
            ].join("\n");
        }
        if (usesBuiltIn("__dirname", sourceCode)) {
            modifiedSourceCode = [
                `const __dirname = (()=>{`,
                `    const {url: urlStr}= import.meta;`,
                `    const url= new URL(urlStr);`,
                `    const __filename = url.protocol === "file:" ? url.pathname : urlStr;`,
                `    return __filename.replace(/[/][^/]*$/, '');`,
                `})();`,
                ``,
                modifiedSourceCode
            ].join("\n");
        }
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
                modifiedSourceCode = await replaceAsync_1.replaceAsync(modifiedSourceCode, new RegExp(regExpStr, "mg"), replacerAsync);
            }
        }
        return modifiedSourceCode;
    }
    return { denoifySingleFile };
}
exports.denoifySingleFileFactory = denoifySingleFileFactory;
//TODO: Improve!
function usesBuiltIn(builtIn, sourceCode) {
    return sourceCode.indexOf(builtIn) >= 0;
}
