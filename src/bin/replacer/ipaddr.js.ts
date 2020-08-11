
import { Version, is404, ParsedImportExportStatement } from "../../lib";
import type { Replacer } from "../../lib";

export const replacer: Replacer = async params => {

    const { parsedImportExportStatement, version } = params;


    if (parsedImportExportStatement.parsedArgument.nodeModuleName !== "ipaddr.js") {
        return undefined;
    }

    const firstVersionWithType= "1.6.0";

    const typeVersion = Version.compare(
        Version.parse(version),
        Version.parse(firstVersionWithType)
    ) <= 0 ?
        firstVersionWithType :
        version;

    const urlTypes= `https://raw.githubusercontent.com/whitequark/ipaddr.js/v${typeVersion}/lib/ipaddr.js.d.ts`;
    
    if (await is404(urlTypes)) {

        if( version === firstVersionWithType ){
            //It would means that the repo have been removed.
            return undefined;
        }

        return replacer({...params, "version": firstVersionWithType });

    }

    if( parsedImportExportStatement.isAsyncImport ){
        throw new Error("TODO, async import of ipaddr.js not supported");
    }

    const match = parsedImportExportStatement.target?.match(/^\*\s+as\s+(.*)$/);

    if( !match ){
        throw new Error("expect import ipaddr.js as a namespace");
    }

    const parsedImportExportStatementOut: ParsedImportExportStatement<"URL"> = {
        ...parsedImportExportStatement,
        "parsedArgument": {
            "type": "URL",
            "url": `https://jspm.dev/ipaddr.js@${version}`
        }
    };

    parsedImportExportStatementOut.target = match[1];

    return [
        `// @deno-types="${urlTypes}"`,
        ParsedImportExportStatement.stringify(parsedImportExportStatementOut)
    ].join("\n");

};
