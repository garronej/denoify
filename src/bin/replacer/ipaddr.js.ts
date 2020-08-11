
import type { Replacer } from "../../lib";

//NOTE: Type definitions not imported.
export const replacer: Replacer = async params => {

    const { parsedImportExportStatement, version } = params;

    if (parsedImportExportStatement.parsedArgument.nodeModuleName !== "ipaddr.js") {
        return undefined;
    }

    if( parsedImportExportStatement.isAsyncImport ){
        throw new Error("TODO, async import of ipaddr.js not supported yet");
    }

    if( parsedImportExportStatement.statementType === "export" ){
        throw new Error("TODO, exporting from ipaddr.js is not supported yey");
    }

    const match = parsedImportExportStatement.target?.match(/^\*\s+as\s+(.*)$/);

    if( !match ){
        throw new Error("expect import ipaddr.js as a namespace");
    }

    //NOTE: Cosmetic, we could use " or '
    const qs = parsedImportExportStatement.quoteSymbol;

    return `import ${match[1]} from ${qs}https://jspm.dev/ipaddr.js@${version}${qs}`;

};
