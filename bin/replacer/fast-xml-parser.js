"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replacer = void 0;
const lib_1 = require("../../lib");
exports.replacer = async (params) => {
    var _a;
    const { parsedImportExportStatement, version } = params;
    if (parsedImportExportStatement.parsedArgument.nodeModuleName !== "fast-xml-parser") {
        return undefined;
    }
    if (parsedImportExportStatement.isAsyncImport) {
        throw new Error("TODO, async import of fast-xml-parser not supported yet");
    }
    if (parsedImportExportStatement.statementType === "export") {
        throw new Error("TODO, exporting from fast-xml-parser is not supported yet");
    }
    const getUrlTypes = (version) => `https://raw.githubusercontent.com/NaturalIntelligence/fast-xml-parser/${version}/src/parser.d.ts`;
    let urlTypes = getUrlTypes(version);
    if (await lib_1.is404(urlTypes)) {
        urlTypes = getUrlTypes("3.17.1");
    }
    const match = (_a = parsedImportExportStatement.target) === null || _a === void 0 ? void 0 : _a.match(/^\*\s+as\s+(.*)$/);
    if (!match) {
        throw new Error("expect import fast-xml-parser as a namespace");
    }
    return [
        `import __fastXMLParser from "https://dev.jspm.io/fast-xml-parser@${version}";`,
        `import type * as __t_fastXMLParser from "${urlTypes}";`,
        `const ${match[1]}= __fastXMLParser as typeof __t_fastXMLParser`
    ].join("\n");
};
//# sourceMappingURL=fast-xml-parser.js.map