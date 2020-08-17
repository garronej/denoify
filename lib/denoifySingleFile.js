"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.denoifySingleFileFactory = void 0;
const replaceAsync_1 = require("../tools/replaceAsync");
const crypto = require("crypto");
function denoifySingleFileFactory(params) {
    const { denoifyImportExportStatement } = params;
    /** Returns source code with deno imports replaced */
    async function denoifySingleFile(params) {
        const { dirPath, sourceCode } = params;
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
        if (usesBuiltIn("Buffer", sourceCode)) {
            modifiedSourceCode = [
                `import { Buffer } from "buffer";`,
                modifiedSourceCode
            ].join("\n");
        }
        const denoifiedImportExportStatementByHash = new Map();
        for (const quoteSymbol of [`"`, `'`]) {
            const strRegExpInQuote = `${quoteSymbol}[^${quoteSymbol}\\r\\n]+${quoteSymbol}`;
            for (const regExpStr of [
                ...[
                    `export\\s+\\*\\s+from\\s*${strRegExpInQuote}`,
                    `(?:import|export)(?:\\s+type)?\\s*\\*\\s*as\\s+[^\\s]+\\s+from\\s*${strRegExpInQuote}`,
                    `(?:import|export)(?:\\s+type)?\\s*{[^}]*}\\s*from\\s*${strRegExpInQuote}`,
                    `import(?:\\s+type)?\\s+[^\\*{][^\\s]*\\s+from\\s*${strRegExpInQuote}`,
                    `import\\s*${strRegExpInQuote}`,
                ]
                    .map(s => `(?<=^|[\\r\\n\\s;])${s}`),
                `(?<=[^a-zA-Z\._0-9$\*])import\\s*\\(\\s*${strRegExpInQuote}\\s*\\)` //type Foo = import("...").Foo
            ]) {
                modifiedSourceCode = await replaceAsync_1.replaceAsync(modifiedSourceCode, new RegExp(regExpStr, "g"), async (importExportStatement) => {
                    const denoifiedImportExportStatement = await denoifyImportExportStatement({
                        dirPath,
                        importExportStatement
                    });
                    const hash = crypto
                        .createHash("sha256")
                        .update(denoifiedImportExportStatement)
                        .digest("hex");
                    denoifiedImportExportStatementByHash.set(hash, denoifiedImportExportStatement);
                    return hash;
                });
            }
        }
        for (const [hash, denoifiedImportExportStatement] of denoifiedImportExportStatementByHash) {
            modifiedSourceCode = modifiedSourceCode.replace(new RegExp(hash, "g"), denoifiedImportExportStatement);
        }
        return modifiedSourceCode;
    }
    return { denoifySingleFile };
}
exports.denoifySingleFileFactory = denoifySingleFileFactory;
/*
TODO: This is really at proof of concept stage.

In the current implementation if any of those keyword appear in the source
regardless of the context (including comments) the polyfills will be included.

For now this implementation will do the trick, priority goes to polyfilling the
node's builtins but this need to be improved later on.

*/
function usesBuiltIn(builtIn, sourceCode) {
    switch (builtIn) {
        case "Buffer": {
            //We should return false for example
            //if we have an import from the browserify polyfill
            //e.g.: import { Buffer } from "buffer";
            if (!!sourceCode.match(/import\s*{[^}]*Buffer[^}]*}\s*from\s*["'][^"']+["']/)) {
                return false;
            }
        }
        case "__dirname":
        case "__filename":
            return (new RegExp(`(?:^|[\\s\\(\\);=><{}\\[\\]\\/:?,])${builtIn}(?:$|[^a-zA-Z0-9$_-])`)).test(sourceCode);
    }
}
//# sourceMappingURL=denoifySingleFile.js.map