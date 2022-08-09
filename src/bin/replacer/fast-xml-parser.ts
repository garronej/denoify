import { is404 } from "../../lib";
import type { Replacer } from "../../lib";

const moduleName = "fast-xml-parser";

export const replacer: Replacer = async params => {
    const { parsedImportExportStatement, version } = params;

    if (parsedImportExportStatement.parsedArgument.nodeModuleName !== moduleName) {
        return undefined;
    }

    if (parsedImportExportStatement.isAsyncImport) {
        throw new Error(`TODO, async import of ${moduleName} not supported yet`);
    }

    if (parsedImportExportStatement.statementType === "export") {
        throw new Error(`TODO, exporting from ${moduleName} is not supported yet`);
    }

    if (parsedImportExportStatement.statementType === "declare module") {
        throw new Error(`TODO, module augmentation for ${moduleName} not supported`);
    }

    const getUrlTypes = (version: string) => `https://raw.githubusercontent.com/NaturalIntelligence/fast-xml-parser/${version}/src/parser.d.ts`;

    let urlTypes = getUrlTypes(version);

    if (await is404(urlTypes)) {
        urlTypes = getUrlTypes("3.17.1");
    }

    const match = parsedImportExportStatement.target?.match(/^\*\s+as\s+(.*)$/);

    if (!match) {
        throw new Error("expect import fast-xml-parser as a namespace");
    }

    return [
        `import __fastXMLParser from "https://dev.jspm.io/fast-xml-parser@${version}";`,
        `import type * as __t_fastXMLParser from "${urlTypes}";`,
        `const ${match[1]}= __fastXMLParser as typeof __t_fastXMLParser`
    ].join("\n");
};
