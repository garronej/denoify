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
    typeSafety_1.assert(output, [
        `// @deno-types="https://raw.githubusercontent.com/whitequark/ipaddr.js/v1.8.1/lib/ipaddr.js.d.ts"`,
        `import ipaddr from "https://jspm.dev/ipaddr.js@1.8.1"`
    ].join("\n"));
    console.log("PASS");
})();
//# sourceMappingURL=replacer.js.map