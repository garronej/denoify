import { replaceAsync } from "../tools/replaceAsync";
import type { denoifyImportExportStatementFactory } from "./denoifyImportExportStatement";
import * as crypto from "crypto";
import builtins from "./builtins/index";

/**
 * Remove any lines containing and following // @denoify-line-ignore
 */
const IGNORE_LINE_COMMENT = /^\/\/\s+@denoify-line-ignore/;
function dealWithDenoifyLineIgnoreSpecialComment(sourceCode: string): string {
    let previousLineHadIgnoreComment = false;
    return sourceCode
        .split("\n")
        .filter(line => {
            const thisLineHasIgnoreComment = IGNORE_LINE_COMMENT.test(line);
            const skipThisLine = thisLineHasIgnoreComment || previousLineHadIgnoreComment;

            if (previousLineHadIgnoreComment) {
                previousLineHadIgnoreComment = false;
            }
            if (thisLineHasIgnoreComment) {
                previousLineHadIgnoreComment = thisLineHasIgnoreComment;
            }
            return !skipThisLine;
        })
        .join("\n");
}

export function denoifySingleFileFactory(params: {} & ReturnType<typeof denoifyImportExportStatementFactory>) {
    const { denoifyImportExportStatement } = params;

    /** Returns source code with deno imports replaced */
    async function denoifySingleFile(params: { dirPath: string; sourceCode: string }): Promise<string> {
        const { dirPath, sourceCode } = params;

        // Handle ignore comments
        let modifiedSourceCode = dealWithDenoifyLineIgnoreSpecialComment(sourceCode);

        // Add support for Node builtins
        for (const builtin of builtins) {
            if (builtin.test(modifiedSourceCode)) {
                modifiedSourceCode = [...builtin.modification, modifiedSourceCode].join("\n");
            }
        }

        // Cleanup import/export statements
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
