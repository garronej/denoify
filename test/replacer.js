"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const replacer_1 = require("../lib/replacer");
const ParsedImportExportStatement_1 = require("../lib/types/ParsedImportExportStatement");
const path = require("path");
const typeSafety_1 = require("evt/tools/typeSafety");
const { consumeExecutableReplacer } = replacer_1.consumeExecutableReplacerFactory({
    "filePath": path.join(__dirname, "..", "bin", "replacer", "index.js")
});
(async () => {
    const output = await consumeExecutableReplacer({
        "parsedImportExportStatement": ParsedImportExportStatement_1.ParsedImportExportStatement.parse('import * as ipaddr from "ipaddr.js"'),
        "version": "1.8.1"
    });
    typeSafety_1.assert(output, `import ipaddr from "https://jspm.dev/ipaddr.js@1.8.1"`);
    console.log("PASS");
})();
(async () => {
    const output = await consumeExecutableReplacer({
        "parsedImportExportStatement": ParsedImportExportStatement_1.ParsedImportExportStatement.parse('import * as fastXMLParser from "fast-xml-parser"'),
        "version": "3.17.4"
    });
    typeSafety_1.assert(output, [
        `import __fastXMLParser from "https://dev.jspm.io/fast-xml-parser@3.17.4";`,
        `import type * as __t_fastXMLParser from "https://raw.githubusercontent.com/NaturalIntelligence/fast-xml-parser/3.17.1/src/parser.d.ts";`,
        `const fastXMLParser= __fastXMLParser as typeof __t_fastXMLParser`
    ].join("\n"));
    console.log("PASS");
})();
//# sourceMappingURL=replacer.js.map