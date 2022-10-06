import { consumeExecutableReplacerFactory } from "../lib/replacer";
import { ParsedImportExportStatement } from "../lib/types/ParsedImportExportStatement";
import * as path from "path";

const testReplacer = () =>
    describe("replacer for changing import/export statement from node-compatible to deno-compatible import", () => {
        const { consumeExecutableReplacer } = consumeExecutableReplacerFactory({
            "executableFilePath": path.join(__dirname, "../..", "dist", "bin", "replacer", "index.js")
        });

        it("should change the import specifier", async () => {
            expect(
                await consumeExecutableReplacer({
                    "parsedImportExportStatement": ParsedImportExportStatement.parse(
                        ["import {", "    execute as defaultExecute,", "    getOperationAST,", '} from "graphql"'].join("\n")
                    ) as any,
                    "version": "15.4.0-experimental-stream-defer.1",
                    "destDirPath": "..."
                })
            ).toBe(
                [
                    "import {",
                    "    execute as defaultExecute,",
                    "    getOperationAST,",
                    '} from "https://cdn.skypack.dev/graphql@15.4.0-experimental-stream-defer.1?dts"'
                ].join("\n")
            );

            expect(
                await consumeExecutableReplacer({
                    "parsedImportExportStatement": ParsedImportExportStatement.parse('import { fromEvent } from "rxjs"') as any,
                    "version": "6.6.2",
                    "destDirPath": "..."
                })
            ).toBe(
                [
                    `// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/07a52c868823928b792e870a572b24af36a4b665/rxjs/v6.5.5/rxjs.d.ts"`,
                    `import { fromEvent } from "https://cdn.skypack.dev/rxjs@6.6.2";`
                ].join("\n")
            );

            expect(
                await consumeExecutableReplacer({
                    "parsedImportExportStatement": ParsedImportExportStatement.parse('import { throttleTime } from "rxjs/operators"') as any,
                    "version": "6.6.2",
                    "destDirPath": "..."
                })
            ).toBe(
                [
                    `// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/07a52c868823928b792e870a572b24af36a4b665/rxjs/v6.5.5/operators.d.ts"`,
                    `import __rxjs_operators_ns from "https://dev.jspm.io/rxjs@6.6.2/operators";`,
                    `const { throttleTime } = __rxjs_operators_ns;`
                ].join("\n")
            );
        });

        it("should change the namespace and/or default import", async () => {
            const operatorsParsedImportResult = ["* as operators", "operators"].every(
                async target =>
                    (await consumeExecutableReplacer({
                        "parsedImportExportStatement": ParsedImportExportStatement.parse(`import ${target} from "rxjs/operators"`) as any,
                        "version": "6.6.2",
                        "destDirPath": "..."
                    })) ===
                    [
                        `// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/07a52c868823928b792e870a572b24af36a4b665/rxjs/v6.5.5/operators.d.ts"`,
                        `import operators from "https://dev.jspm.io/rxjs@6.6.2/operators";`
                    ].join("\n")
            );

            expect(operatorsParsedImportResult).toBe(true);

            const webSocketParsedImportResult = ["{ webSocket, WebSocketSubjectConfig }", "* as rxjsWs"].every(
                async target =>
                    (await consumeExecutableReplacer({
                        "parsedImportExportStatement": ParsedImportExportStatement.parse(`import ${target} from "rxjs/webSocket"`) as any,
                        "version": "6.6.2",
                        "destDirPath": "..."
                    })) === `import ${target} from "https://cdn.skypack.dev/rxjs@6.6.2/webSocket?dts";`
            );

            expect(webSocketParsedImportResult).toBe(true);

            expect(
                await consumeExecutableReplacer({
                    "parsedImportExportStatement": ParsedImportExportStatement.parse('import * as ipaddr from "ipaddr.js"') as any,
                    "version": "1.8.1",
                    "destDirPath": "..."
                })
            ).toBe(`import ipaddr from "https://jspm.dev/ipaddr.js@1.8.1"`);

            expect(
                await consumeExecutableReplacer({
                    "parsedImportExportStatement": ParsedImportExportStatement.parse('import * as fastXMLParser from "fast-xml-parser"') as any,
                    "version": "3.17.4",
                    "destDirPath": "..."
                })
            ).toBe(
                [
                    `import __fastXMLParser from "https://dev.jspm.io/fast-xml-parser@3.17.4";`,
                    `import type * as __t_fastXMLParser from "https://raw.githubusercontent.com/NaturalIntelligence/fast-xml-parser/3.17.1/src/parser.d.ts";`,
                    `const fastXMLParser= __fastXMLParser as typeof __t_fastXMLParser`
                ].join("\n")
            );

            const reactParsedImportResult = ["React", "* as React"].every(
                async target =>
                    (await consumeExecutableReplacer({
                        "parsedImportExportStatement": ParsedImportExportStatement.parse(`import ${target} from "react"`) as any,
                        "version": "16.13.1",
                        "destDirPath": "..."
                    })) ===
                    [
                        //`// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/eb9b173f015a13569aa6dd5bee78bac2e43a14db/react/v16.13.1/react.d.ts"`,
                        `import React from "https://dev.jspm.io/react@16.13.1";`
                    ].join("\n")
            );

            expect(reactParsedImportResult).toBe(true);

            const reactDomParsedImportResult = ["ReactDom", "* as ReactDom"].every(
                async target =>
                    (await consumeExecutableReplacer({
                        "parsedImportExportStatement": ParsedImportExportStatement.parse(`import ${target} from "react-dom"`) as any,
                        "version": "16.13.1",
                        "destDirPath": "..."
                    })) ===
                    [
                        `// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/02774811084fd4a85d91f73d27deffff2c6b8d02/react-dom/v16.13.1/react-dom.d.ts"`,
                        `import ReactDom from "https://cdn.skypack.dev/react-dom@16.13.1";`
                    ].join("\n")
            );

            expect(reactDomParsedImportResult).toBe(true);

            const reactDomServerParsedImportResult = ["ReactDom", "* as ReactDom"].every(
                async target =>
                    (await consumeExecutableReplacer({
                        "parsedImportExportStatement": ParsedImportExportStatement.parse(`import ${target} from "react-dom/server"`) as any,
                        "version": "16.13.1",
                        "destDirPath": "..."
                    })) ===
                    [
                        `// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/df2a75e38bf52fa0bf4bd29cd790478e3011fc0f/react-dom/v16.13.1/server.d.ts"`,
                        `import ReactDomServer from "https://dev.jspm.io/react-dom@16.13.1/server.js";`
                    ].join("\n")
            );

            expect(reactDomServerParsedImportResult).toBe(true);
        });
    });

export default testReplacer;
