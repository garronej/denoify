
import { consumeExecutableReplacerFactory } from "../lib/replacer";
import { ParsedImportExportStatement } from "../lib/types/ParsedImportExportStatement";
import * as path from "path";
import { assert } from "evt/tools/typeSafety";

const { consumeExecutableReplacer } = consumeExecutableReplacerFactory({
    "filePath": path.join(__dirname, "..", "bin", "replacer", "index.js")
});


(async () => {

    {

        const output = await consumeExecutableReplacer({
            "parsedImportExportStatement": ParsedImportExportStatement.parse('import * as ipaddr from "ipaddr.js"') as any,
            "version": "1.8.1"
        });

        assert(
            output
            ===
            `import ipaddr from "https://jspm.dev/ipaddr.js@1.8.1"`
        );

    }
    {

        const output = await consumeExecutableReplacer({
            "parsedImportExportStatement": ParsedImportExportStatement.parse('import * as fastXMLParser from "fast-xml-parser"') as any,
            "version": "3.17.4"
        });

        assert(
            output
            ===
            [
                `import __fastXMLParser from "https://dev.jspm.io/fast-xml-parser@3.17.4";`,
                `import type * as __t_fastXMLParser from "https://raw.githubusercontent.com/NaturalIntelligence/fast-xml-parser/3.17.1/src/parser.d.ts";`,
                `const fastXMLParser= __fastXMLParser as typeof __t_fastXMLParser`
            ].join("\n")
        );

    }

    {

        const output = await consumeExecutableReplacer({
            "parsedImportExportStatement": ParsedImportExportStatement.parse('import ReactAbc from "react"') as any,
            "version": "16.13.1"
        });

        assert(
            output
            ===
            [
                `// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/eb9b173f015a13569aa6dd5bee78bac2e43a14db/react/v16.13.1/react.d.ts"`,
                `import ReactAbc from "https://dev.jspm.io/react@16.13.1";`
            ].join("\n")
        );

    }

    console.log("PASS");

})();





