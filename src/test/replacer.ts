
import { consumeExecutableReplacerFactory } from "../lib/replacer";
import { ParsedImportExportStatement } from "../lib/types/ParsedImportExportStatement";
import * as path from "path";
import { assert } from "evt/tools/typeSafety";

const { consumeExecutableReplacer } = consumeExecutableReplacerFactory({
    "executableFilePath": path.join(__dirname, "..", "bin", "replacer", "index.js")
});


(async () => {

    {

        const output = await consumeExecutableReplacer({
            "parsedImportExportStatement": ParsedImportExportStatement.parse('import * as ipaddr from "ipaddr.js"') as any,
            "version": "1.8.1",
            "destDirPath": "..."
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
            "version": "3.17.4",
            "destDirPath": "..."
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

    for( const x of ["React", "* as React"]){

        const output = await consumeExecutableReplacer({
            "parsedImportExportStatement": ParsedImportExportStatement.parse(`import ${x} from "react"`) as any,
            "version": "16.13.1",
            "destDirPath": "..."
        });

        assert(
            output
            ===
            [
                //`// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/eb9b173f015a13569aa6dd5bee78bac2e43a14db/react/v16.13.1/react.d.ts"`,
                `import React from "https://dev.jspm.io/react@16.13.1";`
            ].join("\n")
        );

    }


    for( const x of ["ReactDom", "* as ReactDom"]){

        const output = await consumeExecutableReplacer({
            "parsedImportExportStatement": ParsedImportExportStatement.parse(`import ${x} from "react-dom"`) as any,
            "version": "16.13.1",
            "destDirPath": "..."
        });

        assert(
            output
            ===
            [
                `// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/02774811084fd4a85d91f73d27deffff2c6b8d02/react-dom/v16.13.1/react-dom.d.ts"`,
                `import ReactDom from "https://cdn.pika.dev/react-dom@16.13.1";`
            ].join("\n")
        );

    }

    for (const x of ["ReactDomServer", "* as ReactDomServer"]) {

        const output = await consumeExecutableReplacer({
            "parsedImportExportStatement": ParsedImportExportStatement.parse(`import ${x} from "react-dom/server"`) as any,
            "version": "16.13.1",
            "destDirPath": "..."
            
        });

        assert(
            output
            ===
            [
                `// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/df2a75e38bf52fa0bf4bd29cd790478e3011fc0f/react-dom/v16.13.1/server.d.ts"`,
                `import ReactDomServer from "https://dev.jspm.io/react-dom@16.13.1/server.js";`
            ].join("\n")
        );

    }

    console.log("PASS");

})();





