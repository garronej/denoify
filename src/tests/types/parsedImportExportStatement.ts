import { ParsedImportExportStatement } from "../../lib/types/ParsedImportExportStatement";

const testParsedImportExportStatementTypes = () =>
    describe("get the proper result of parsed import export statement", () => {
        it("should extract useful information from import statement", () => {
            const parsedImportExportStatement1 = ParsedImportExportStatement.parse('import \n\n    * as _ \n\nfrom \n\n"xxx"');
            expect(parsedImportExportStatement1).toStrictEqual({
                "isAsyncImport": false,
                "parsedArgument": {
                    "type": "DEPENDENCY",
                    "nodeModuleName": "xxx",
                    "specificImportPath": undefined
                },
                "isTypeOnly": false,
                "quoteSymbol": '"',
                "statementType": "import",
                "target": "* as _"
            });
            expect(ParsedImportExportStatement.stringify(parsedImportExportStatement1)).toBe(`import * as _ from "xxx"`);

            const importStatement2 = 'import * as foobar from "xxx"';
            const parsedImportExportStatement2 = ParsedImportExportStatement.parse(importStatement2);
            expect(parsedImportExportStatement2).toStrictEqual({
                "isAsyncImport": false,
                "parsedArgument": {
                    "type": "DEPENDENCY",
                    "nodeModuleName": "xxx",
                    "specificImportPath": undefined
                },
                "isTypeOnly": false,
                "quoteSymbol": '"',
                "statementType": "import",
                "target": "* as foobar"
            });
            expect(ParsedImportExportStatement.stringify(parsedImportExportStatement2)).toBe(importStatement2);

            const importStatement3 = 'import * as d from "xxx"';
            const parsedImportExportStatement3 = ParsedImportExportStatement.parse(importStatement3);
            expect(parsedImportExportStatement3).toStrictEqual({
                "isAsyncImport": false,
                "parsedArgument": {
                    "type": "DEPENDENCY",
                    "nodeModuleName": "xxx",
                    "specificImportPath": undefined
                },
                "isTypeOnly": false,
                "quoteSymbol": '"',
                "statementType": "import",
                "target": "* as d"
            });
            expect(ParsedImportExportStatement.stringify(parsedImportExportStatement3)).toBe(importStatement3);

            const importStatement4 = 'import { } from "xxx"';
            const parsedImportExportStatement4 = ParsedImportExportStatement.parse(importStatement4);
            expect(parsedImportExportStatement4).toStrictEqual({
                "isAsyncImport": false,
                "parsedArgument": {
                    "type": "DEPENDENCY",
                    "nodeModuleName": "xxx",
                    "specificImportPath": undefined
                },
                "isTypeOnly": false,
                "quoteSymbol": '"',
                "statementType": "import",
                "target": "{ }"
            });
            expect(ParsedImportExportStatement.stringify(parsedImportExportStatement4)).toBe(importStatement4);

            const importStatement5 = 'import "xxx"';
            const parsedImportExportStatement5 = ParsedImportExportStatement.parse(importStatement5);
            expect(parsedImportExportStatement5).toStrictEqual({
                "parsedArgument": {
                    "type": "DEPENDENCY",
                    "nodeModuleName": "xxx",
                    "specificImportPath": undefined
                },
                "isAsyncImport": false,
                "quoteSymbol": '"',
                "statementType": "import",
                "target": undefined
            });
            expect(ParsedImportExportStatement.stringify(parsedImportExportStatement5)).toBe(importStatement5);

            const importStatement6 = 'import ("xxx")';
            const parsedImportExportStatement6 = ParsedImportExportStatement.parse(` ${importStatement6}`);
            expect(parsedImportExportStatement6).toStrictEqual({
                "isAsyncImport": true,
                "quoteSymbol": '"',
                "parsedArgument": {
                    "type": "DEPENDENCY",
                    "nodeModuleName": "xxx",
                    "specificImportPath": undefined
                },
                "target": undefined
            });
            expect(ParsedImportExportStatement.stringify(parsedImportExportStatement6)).toBe(importStatement6);

            const parsedImportExportStatement7 = ParsedImportExportStatement.parse("import * as foo from 'xxx'");
            expect(parsedImportExportStatement7).toStrictEqual({
                "isAsyncImport": false,
                "parsedArgument": {
                    "type": "DEPENDENCY",
                    "nodeModuleName": "xxx",
                    "specificImportPath": undefined
                },
                "isTypeOnly": false,
                "quoteSymbol": "'",
                "statementType": "import",
                "target": "* as foo"
            });
            expect(ParsedImportExportStatement.stringify(parsedImportExportStatement7)).toBe(`import * as foo from \'xxx\'`);

            const importStatement8 = "import type * as foo from 'xxx'";
            const parsedImportExportStatement8 = ParsedImportExportStatement.parse(importStatement8);
            expect(parsedImportExportStatement8).toStrictEqual({
                "isAsyncImport": false,
                "parsedArgument": {
                    "type": "DEPENDENCY",
                    "nodeModuleName": "xxx",
                    "specificImportPath": undefined
                },
                "isTypeOnly": true,
                "quoteSymbol": "'",
                "statementType": "import",
                "target": "* as foo"
            });
            expect(ParsedImportExportStatement.stringify(parsedImportExportStatement8)).toBe(importStatement8);

            const parsedImportExportStatement9 = ParsedImportExportStatement.parse("import type  { Cat } from 'xxx'");
            expect(parsedImportExportStatement9).toStrictEqual({
                "isAsyncImport": false,
                "parsedArgument": {
                    "type": "DEPENDENCY",
                    "nodeModuleName": "xxx",
                    "specificImportPath": undefined
                },
                "isTypeOnly": true,
                "quoteSymbol": "'",
                "statementType": "import",
                "target": "{ Cat }"
            });
            expect(ParsedImportExportStatement.stringify(parsedImportExportStatement9)).toBe("import type { Cat } from 'xxx'");

            const importStatement10 = `import { from } from "./Evt.from"`;
            const parsedImportExportStatement10 = ParsedImportExportStatement.parse(importStatement10);
            expect(parsedImportExportStatement10).toStrictEqual({
                "isAsyncImport": false,
                "parsedArgument": {
                    "type": "PROJECT LOCAL FILE",
                    "relativePath": "./Evt.from"
                },
                "isTypeOnly": false,
                "quoteSymbol": '"',
                "statementType": "import",
                "target": "{ from }"
            });
            expect(ParsedImportExportStatement.stringify(parsedImportExportStatement10)).toBe(importStatement10);

            const importStatement11 = `import { useEvt } from "evt/hooks/useEvt"`;
            const parsedImportExportStatement11 = ParsedImportExportStatement.parse(importStatement11);
            expect(parsedImportExportStatement11).toStrictEqual({
                "isAsyncImport": false,
                "parsedArgument": {
                    "type": "DEPENDENCY",
                    "nodeModuleName": "evt",
                    "specificImportPath": "hooks/useEvt"
                },
                "isTypeOnly": false,
                "quoteSymbol": '"',
                "statementType": "import",
                "target": "{ useEvt }"
            });
            expect(ParsedImportExportStatement.stringify(parsedImportExportStatement11)).toBe(importStatement11);

            const importStatement12 = `import { DefaultAzureCredential, ClientSecretCredential, } from '@azure/identity'`;
            const parsedImportExportStatement12 = ParsedImportExportStatement.parse(importStatement12);
            expect(parsedImportExportStatement12).toStrictEqual({
                "isAsyncImport": false,
                "parsedArgument": {
                    "type": "DEPENDENCY",
                    "nodeModuleName": "@azure/identity",
                    "specificImportPath": undefined
                },
                "isTypeOnly": false,
                "quoteSymbol": "'",
                "statementType": "import",
                "target": "{ DefaultAzureCredential, ClientSecretCredential, }"
            });
            expect(ParsedImportExportStatement.stringify(parsedImportExportStatement12)).toBe(importStatement12);

            const importStatement13 = `import Parser, { ParserOptions } from './stream-parser'`;
            const parsedImportExportStatement13 = ParsedImportExportStatement.parse(importStatement13);
            expect(parsedImportExportStatement13).toStrictEqual({
                "isAsyncImport": false,
                "parsedArgument": {
                    "type": "PROJECT LOCAL FILE",
                    "relativePath": "./stream-parser"
                },
                "isTypeOnly": false,
                "quoteSymbol": "'",
                "statementType": "import",
                "target": "Parser, { ParserOptions }"
            });
            expect(ParsedImportExportStatement.stringify(parsedImportExportStatement13)).toBe(importStatement13);
        });
    });

export default testParsedImportExportStatementTypes;
