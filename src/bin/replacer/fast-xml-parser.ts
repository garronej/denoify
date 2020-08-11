import { is404, ParsedImportExportStatement } from "../../lib";
import type { Replacer } from "../../lib";

export const replacer: Replacer = async params => {

    const { parsedImportExportStatement, version } = params;


    if (parsedImportExportStatement.parsedArgument.nodeModuleName !== "fast-xml-parser") {
        return undefined;
    }

    if( parsedImportExportStatement.isAsyncImport ){
        throw new Error("TODO, async import of fast-xml-parser not supported yet");
    }

    if( parsedImportExportStatement.statementType === "export" ){
        throw new Error("TODO, exporting from fast-xml-parser is not supported yet");
    }

    const getUrlTypes = (version: string) =>
        `https://raw.githubusercontent.com/NaturalIntelligence/fast-xml-parser/${
        version
        }/src/parser.d.ts`;

    let urlTypes = getUrlTypes(version);

    if (await is404(urlTypes)) {

        urlTypes = getUrlTypes("3.17.1");

    }

    const match = parsedImportExportStatement.target?.match(/^\*\s+as\s+(.*)$/);

    if (!match) {
        throw new Error("expect import fast-xml-parser as a namespace");
    }

    const parsedImportExportStatementOut: ParsedImportExportStatement<"URL"> = {
        ...parsedImportExportStatement,
        "parsedArgument": {
            "type": "URL",
            "url": `https://dev.jspm.io/fast-xml-parser@${version}`
        }
    };

    parsedImportExportStatementOut.target = match[1];

    return [
        `import __fastXMLParser from "https://dev.jspm.io/fast-xml-parser@${version}";`,
        `import type * as __t_fastXMLParser from "${urlTypes}";`,
        `const ${match[1]}= __fastXMLParser as typeof __t_fastXMLParser`
    ].join("\n");

};