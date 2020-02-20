
import * as path from "path";
type GetDenoModuleRepo = import("./getDenoModuleRepoFactory").GetDenoModuleRepo;

function makeStatic<T extends (...args: any[]) => Promise<any>>(f: T): T {

    const previousResults = new Map<string, ReturnType<T>>();

    return (async function callee(...args: Parameters<T>): Promise<any>{

        const key= JSON.stringify(args);

        if( previousResults.has(key) ){
            return previousResults.get(key) as any;
        }

        previousResults.set(key, await f(...args));

        return callee(...args);

    }) as unknown as T;

}



function toDenoImportFactory(
    params: {
        getDenoModuleRepo: GetDenoModuleRepo
    }
) {

    const getDenoModuleStatic = makeStatic(
        params.getDenoModuleRepo
    );

    async function toDenoImport(importStr: string): Promise<string> {

        if (importStr.startsWith(".")) {

            if (/\.json$/i.test(importStr)) {
                return importStr;
            }

            return `${importStr}.ts`;

        }

        const [moduleName, ...rest] = importStr.split("/");

        const { url, main } = await getDenoModuleStatic(moduleName);

        return path.join(...[
            path.join(url, rest.length === 0 ? main : ""),
            ...rest.map((...[, index]) => index === rest.length - 1 ?
                rest[index] + ".ts" : rest[index]
            )
        ]);

    }

    return { toDenoImport };

}

async function replaceAsync(
    str: string,
    regex: RegExp,
    replacerAsync: (str: string, ...args: any[]) => Promise<string>
) {

    const promises: Promise<string>[] = [];

    str.replace(regex, (match, ...args) => {
        const promise = replacerAsync(match, ...args);
        promises.push(promise);
        return "";
    });

    const data = await Promise.all(promises);

    return str.replace(regex, () => data.shift()!);

}

export function replaceImportsFactory(
    params: {
        getDenoModuleRepo: GetDenoModuleRepo
    }
) {

    const { getDenoModuleRepo } = params;

    const { toDenoImport } = toDenoImportFactory({ getDenoModuleRepo });

    /** Returns source code with deno imports replaced */
    async function replaceImports(
        params: {
            sourceCode: string,
        }
    ): Promise<string> {

        const { sourceCode } = params;

        let out = sourceCode;

        for (const quoteSymbol of [`"`, `'`]) {

            const strRegExpInQuote = `${quoteSymbol}[^${quoteSymbol}]+${quoteSymbol}`

            //TODO: Remove 
            const strRegExpEnd = `${strRegExpInQuote}\\s*;?`;

            const replacerAsync = (() => {

                const regExpReplaceInQuote = new RegExp(
                    `^([^${quoteSymbol}]*${quoteSymbol})([^${quoteSymbol}]+)(${quoteSymbol}[^${quoteSymbol}]*)$`,
                    "m"
                );

                return async (substring: string) => {

                    const [, before, importStr, after] = substring.match(regExpReplaceInQuote)!;

                    return `${before}${await toDenoImport(importStr)}${after}`;

                };

            })();

            for (const regExpStr of [
                `import\\s+\\*\\s+as\\s+[^\\s]+\\s+from\\s+${strRegExpEnd}`,
                `import\\s*\\{[^\\}]*}\\s*from\\s*${strRegExpEnd}`,
                `import\\s*${strRegExpEnd}`,
                ...["import", "require"].map(keyword => `[^a-zA-Z\._0-9$]${keyword}\\s*\\(\\s*${strRegExpInQuote}\\s*\\)`)

            ]) {

                out = await replaceAsync(
                    out,
                    new RegExp(regExpStr, "mg"),
                    replacerAsync
                );


            }

        }

        return out;

    }


    return { replaceImports };


}





