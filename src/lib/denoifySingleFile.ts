
import { replaceAsync } from "../tools/replaceAsync";
import type {denoifyImportArgumentFactory} from "./denoifyImportArgument";

export function denoifySingleFileFactory(
    params: {
        denoifyImportArgument: ReturnType<typeof denoifyImportArgumentFactory>["denoifyImportArgument"]
    }
) {

    const { denoifyImportArgument } = params;

    /** Returns source code with deno imports replaced */
    async function denoifySingleFile(
        params: {
            fileDirPath: string;
            sourceCode: string;
        }
    ): Promise<string> {

        const { fileDirPath, sourceCode } = params;

        let modifiedSourceCode = sourceCode;

        if (usesBuiltIn("__dirname", sourceCode)) {

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

                const regExpReplaceInQuote = new RegExp(
                    `^([^${quoteSymbol}]*${quoteSymbol})([^${quoteSymbol}]+)(${quoteSymbol}[^${quoteSymbol}]*)$`,
                    "m"
                );

                return async (substring: string) => {

                    const [, before, importArgument, after] = substring.match(regExpReplaceInQuote)!;

                    return `${before}${await denoifyImportArgument({ fileDirPath, importArgument })}${after}`;

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

                modifiedSourceCode = await replaceAsync(
                    modifiedSourceCode,
                    new RegExp(regExpStr, "mg"),
                    replacerAsync
                );

            }

        }

        return modifiedSourceCode;

    }


    return { denoifySingleFile };


}

//TODO: Improve!
function usesBuiltIn(
        builtIn: "__filename" | "__dirname" | "require" | "Buffer",
        sourceCode: string
): boolean {

    return sourceCode.indexOf(builtIn) >= 0;

}






