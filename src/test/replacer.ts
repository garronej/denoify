
import { consumeExecutableReplacerFactory } from "../lib/replacer";
import { ParsedImportExportStatement } from "../lib/types/ParsedImportExportStatement";
import * as path from "path";
import { assert } from "evt/tools/typeSafety";

const { consumeExecutableReplacer } = consumeExecutableReplacerFactory({
    "filePath": path.join(__dirname, "..", "bin", "replacer", "index.js")
});


(async () => {

    const output = await consumeExecutableReplacer({
        "parsedImportExportStatement": ParsedImportExportStatement.parse('import * as ipaddr from "ipaddr.js"') as any,
        "version": "1.8.1"
    });

    assert(
        output,
        `import ipaddr from "https://jspm.dev/ipaddr.js@1.8.1"`
    );

    console.log("PASS");

})();

(async () => {

    const output = await consumeExecutableReplacer({
        "parsedImportExportStatement": ParsedImportExportStatement.parse('import * as fastXMLParser from "fast-xml-parser"') as any,
        "version": "3.17.4"
    });

    assert(
        output,
        [
            `import __fastXMLParser from "https://dev.jspm.io/fast-xml-parser@3.17.4";`,
            `import type * as __t_fastXMLParser from "https://raw.githubusercontent.com/NaturalIntelligence/fast-xml-parser/3.17.1/src/parser.d.ts";`,
            `const fastXMLParser= __fastXMLParser as typeof __t_fastXMLParser`
        ].join("\n")
    );

    console.log("PASS");

})();





