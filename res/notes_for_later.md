# Roadmap

Now that we have `ParsedImportExportStatement` we can implement a wat to, on a case by case basis add
support for third party library by writing custom import and enable user to write their own import.
Example with `ipaddr.js`:

```typescript
import { Version } from "../../tools/Version";
import { ParsedImportExportStatement } from "../types/ParsedImportExportStatement";

export async function importExportStatementReplacer(
    params: {
        importExportStatement: string,
        version: string
    }
): Promise<undefined | string> {

    const { importExportStatement, version } = params;

    const parsedImportExportStatement = ParsedImportExportStatement.parse(importExportStatement);

    if (parsedImportExportStatement.argument !== "ipaddr.js") {
        return undefined;
    }


    const typeVersion = Version.compare(
        Version.parse(version),
        Version.parse("1.6.0")
    ) <= 0 ?
        "1.6.0" :
        version;

    return [
        `// @deno-types="https://raw.githubusercontent.com/whitequark/ipaddr.js/${typeVersion}/lib/ipaddr.js.d.ts"`,
        ParsedImportExportStatement.stringify({
            ...parsedImportExportStatement,
            "argument": `https://raw.githubusercontent.com/whitequark/ipaddr.js/${version}/lib/ipaddr.js`
        })
    ].join("\n");

}
```