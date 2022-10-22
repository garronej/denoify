import { replaceAsync } from "../tools/replaceAsync";
import type { denoifyImportExportStatementFactory } from "./denoifyImportExportStatement";
import * as crypto from "crypto";

export function denoifySingleFileFactory(params: {} & ReturnType<typeof denoifyImportExportStatementFactory>) {
    const { denoifyImportExportStatement } = params;

    /** Returns source code with deno imports replaced */
    async function denoifySingleFile(params: { dirPath: string; sourceCode: string }): Promise<string> {
        const { dirPath, sourceCode } = params;

        let modifiedSourceCode = sourceCode;

        modifiedSourceCode = (function dealWithDenoifyLineIgnoreSpecialComment(sourceCode: string): string {
            let split = sourceCode.split("\n");

            split = split.map((line, i) => (i === split.length - 1 ? line : `${line}\n`));

            const outSplit = [];

            for (let i = 0; i < split.length; i++) {
                const line = split[i];

                if (!line.startsWith("// @denoify-line-ignore")) {
                    outSplit.push(line);
                    continue;
                }

                i++;
            }

            return outSplit.join("");
        })(modifiedSourceCode);

        if (usesBuiltIn("__filename", sourceCode)) {
            modifiedSourceCode = [
                `const __filename = (() => {`,
                `    const { url: urlStr } = import.meta;`,
                `    const url = new URL(urlStr);`,
                `    const __filename = (url.protocol === "file:" ? url.pathname : urlStr);`,
                ``,
                `    const isWindows = (() => {`,
                ``,
                `        let NATIVE_OS: typeof Deno.build.os = "linux";`,
                `        // eslint-disable-next-line @typescript-eslint/no-explicit-any`,
                `        const navigator = (globalThis as any).navigator;`,
                `        if (globalThis.Deno != null) {`,
                `            NATIVE_OS = Deno.build.os;`,
                `        } else if (navigator?.appVersion?.includes?.("Win") ?? false) {`,
                `            NATIVE_OS = "windows";`,
                `        }`,
                ``,
                `        return NATIVE_OS == "windows";`,
                ``,
                `    })();`,
                ``,
                `    return isWindows ?`,
                `        __filename.split("/").join("\\\\").substring(1) :`,
                `        __filename;`,
                `})();`,
                ``,
                modifiedSourceCode
            ].join("\n");
        }

        if (usesBuiltIn("__dirname", sourceCode)) {
            modifiedSourceCode = [
                `const __dirname = (() => {`,
                `    const { url: urlStr } = import.meta;`,
                `    const url = new URL(urlStr);`,
                `    const __filename = (url.protocol === "file:" ? url.pathname : urlStr)`,
                `        .replace(/[/][^/]*$/, '');`,
                ``,
                `    const isWindows = (() => {`,
                ``,
                `        let NATIVE_OS: typeof Deno.build.os = "linux";`,
                `        // eslint-disable-next-line @typescript-eslint/no-explicit-any`,
                `        const navigator = (globalThis as any).navigator;`,
                `        if (globalThis.Deno != null) {`,
                `            NATIVE_OS = Deno.build.os;`,
                `        } else if (navigator?.appVersion?.includes?.("Win") ?? false) {`,
                `            NATIVE_OS = "windows";`,
                `        }`,
                ``,
                `        return NATIVE_OS == "windows";`,
                ``,
                `    })();`,
                ``,
                `    return isWindows ?`,
                `        __filename.split("/").join("\\\\").substring(1) :`,
                `        __filename;`,
                `})();`,
                ``,
                modifiedSourceCode
            ].join("\n");
        }

        if (usesBuiltIn("Buffer", sourceCode)) {
            modifiedSourceCode = [`import { Buffer } from "buffer";`, modifiedSourceCode].join("\n");
        }

        const denoifiedImportExportStatementByHash = new Map<string, string>();

        for (const quoteSymbol of [`"`, `'`]) {
            const strRegExpInQuote = `${quoteSymbol}[^${quoteSymbol}\\r\\n]+${quoteSymbol}`;

            for (const regExpStr of [
                ...[
                    `export\\s+\\*\\s+from\\s*${strRegExpInQuote}`, //export * from "..."
                    `(?:import|export)(?:\\s+type)?\\s*\\*\\s*as\\s+[^\\s]+\\s+from\\s*${strRegExpInQuote}`, //import/export [type] * as ns from "..."
                    `(?:import|export)(?:\\s+type)?\\s*{[^}]*}\\s*from\\s*${strRegExpInQuote}`, //import/export [type] { Cat } from "..."
                    `import(?:\\s+type)?\\s+[^\\*{][^\\s]*\\s*(?:,\\s*{[^}]*})?\\s+from\\s*${strRegExpInQuote}`, //import [type] Foo[, { Bar, Baz }] from "..."
                    `import\\s*${strRegExpInQuote}`, //import "..."
                    `declare\\s+module\\s+${strRegExpInQuote}`
                ].map(s => `(?<=^|[\\r\\n\\s;])(?<! \\* )${s}`),
                `(?<=[^a-zA-Z\._0-9$\*])import\\s*\\(\\s*${strRegExpInQuote}\\s*\\)` //type Foo = import("...").Foo
            ]) {
                modifiedSourceCode = await replaceAsync(modifiedSourceCode, new RegExp(regExpStr, "g"), async importExportStatement => {
                    const denoifiedImportExportStatement = await denoifyImportExportStatement({
                        dirPath,
                        importExportStatement
                    });

                    const hash = crypto.createHash("sha256").update(denoifiedImportExportStatement).digest("hex");

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

/*
TODO: This is really at proof of concept stage.

In the current implementation if any of those keyword appear in the source
regardless of the context (including comments) the polyfills will be included.

For now this implementation will do the trick, priority goes to polyfilling the
node's builtins but this need to be improved later on.

*/
function usesBuiltIn(builtIn: "__filename" | "__dirname" | "Buffer", sourceCode: string): boolean {
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
            return new RegExp(`(?:^|[\\s\\(\\);=><{}\\[\\]\\/:?,])${builtIn}(?:$|[^a-zA-Z0-9$_-])`).test(sourceCode);
    }
}
