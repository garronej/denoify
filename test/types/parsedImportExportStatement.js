"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ParsedImportExportStatement_1 = require("../../lib/types/ParsedImportExportStatement");
const inDepth_1 = require("evt/tools/inDepth");
const typeSafety_1 = require("evt/tools/typeSafety");
{
    const parsedImportExportStatement = ParsedImportExportStatement_1.ParsedImportExportStatement.parse('import \n\n    * as _ \n\nfrom \n\n"xxx"');
    typeSafety_1.assert(inDepth_1.same(parsedImportExportStatement, {
        "isAsyncImport": false,
        "parsedArgument": {
            "type": "DEPENDENCY",
            "nodeModuleName": "xxx",
            "specificImportPath": undefined
        },
        "isTypeOnly": false,
        "quoteSymbol": '"',
        "statementType": "import",
        "target": '* as _'
    }));
    typeSafety_1.assert(ParsedImportExportStatement_1.ParsedImportExportStatement.stringify(parsedImportExportStatement)
        ===
            `import * as _ from "xxx"`);
}
{
    const parsedImportExportStatement = ParsedImportExportStatement_1.ParsedImportExportStatement.parse('import * as foobar from "xxx"');
    typeSafety_1.assert(inDepth_1.same(parsedImportExportStatement, {
        "isAsyncImport": false,
        "parsedArgument": {
            "type": "DEPENDENCY",
            "nodeModuleName": "xxx",
            "specificImportPath": undefined
        },
        "isTypeOnly": false,
        "quoteSymbol": "\"",
        "statementType": "import",
        "target": "* as foobar"
    }));
    typeSafety_1.assert(ParsedImportExportStatement_1.ParsedImportExportStatement.stringify(parsedImportExportStatement)
        ===
            `import * as foobar from "xxx"`);
}
{
    const parsedImportExportStatement = ParsedImportExportStatement_1.ParsedImportExportStatement.parse('import * as d from "xxx"');
    typeSafety_1.assert(inDepth_1.same(parsedImportExportStatement, {
        "isAsyncImport": false,
        "parsedArgument": {
            "type": "DEPENDENCY",
            "nodeModuleName": "xxx",
            "specificImportPath": undefined
        },
        "isTypeOnly": false,
        "quoteSymbol": "\"",
        "statementType": "import",
        "target": "* as d"
    }));
    typeSafety_1.assert(ParsedImportExportStatement_1.ParsedImportExportStatement.stringify(parsedImportExportStatement)
        ===
            `import * as d from "xxx"`);
}
{
    const parsedImportExportStatement = ParsedImportExportStatement_1.ParsedImportExportStatement.parse('import { } from "xxx"');
    typeSafety_1.assert(inDepth_1.same(parsedImportExportStatement, {
        "isAsyncImport": false,
        "parsedArgument": {
            "type": "DEPENDENCY",
            "nodeModuleName": "xxx",
            "specificImportPath": undefined
        },
        "isTypeOnly": false,
        "quoteSymbol": "\"",
        "statementType": "import",
        "target": "{ }"
    }));
    typeSafety_1.assert(ParsedImportExportStatement_1.ParsedImportExportStatement.stringify(parsedImportExportStatement)
        ===
            `import { } from "xxx"`);
}
{
    const parsedImportExportStatement = ParsedImportExportStatement_1.ParsedImportExportStatement.parse('import "xxx"');
    typeSafety_1.assert(inDepth_1.same(parsedImportExportStatement, {
        "parsedArgument": {
            "type": "DEPENDENCY",
            "nodeModuleName": "xxx",
            "specificImportPath": undefined
        },
        "isAsyncImport": false,
        "quoteSymbol": "\"",
        "statementType": "import",
        "target": undefined
    }));
    typeSafety_1.assert(ParsedImportExportStatement_1.ParsedImportExportStatement.stringify(parsedImportExportStatement)
        ===
            `import "xxx"`);
}
{
    const parsedImportExportStatement = ParsedImportExportStatement_1.ParsedImportExportStatement.parse(' import("xxx")');
    typeSafety_1.assert(inDepth_1.same(parsedImportExportStatement, {
        "isAsyncImport": true,
        "quoteSymbol": "\"",
        "parsedArgument": {
            "type": "DEPENDENCY",
            "nodeModuleName": "xxx",
            "specificImportPath": undefined
        },
        "target": undefined
    }));
    typeSafety_1.assert(ParsedImportExportStatement_1.ParsedImportExportStatement.stringify(parsedImportExportStatement)
        ===
            `import("xxx")`);
}
{
    const parsedImportExportStatement = ParsedImportExportStatement_1.ParsedImportExportStatement.parse('import * as foo from \'xxx\'');
    typeSafety_1.assert(inDepth_1.same(parsedImportExportStatement, {
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
    }));
    typeSafety_1.assert(ParsedImportExportStatement_1.ParsedImportExportStatement.stringify(parsedImportExportStatement)
        ===
            `import * as foo from \'xxx\'`);
}
{
    const parsedImportExportStatement = ParsedImportExportStatement_1.ParsedImportExportStatement.parse('import type * as foo from \'xxx\'');
    typeSafety_1.assert(inDepth_1.same(parsedImportExportStatement, {
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
    }));
    typeSafety_1.assert(ParsedImportExportStatement_1.ParsedImportExportStatement.stringify(parsedImportExportStatement)
        ===
            'import type * as foo from \'xxx\'');
}
{
    const parsedImportExportStatement = ParsedImportExportStatement_1.ParsedImportExportStatement.parse('import type  { Cat } from \'xxx\'');
    typeSafety_1.assert(inDepth_1.same(parsedImportExportStatement, {
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
    }));
    typeSafety_1.assert(ParsedImportExportStatement_1.ParsedImportExportStatement.stringify(parsedImportExportStatement)
        ===
            'import type { Cat } from \'xxx\'');
}
{
    const parsedImportExportStatement = ParsedImportExportStatement_1.ParsedImportExportStatement.parse(`import { from } from "./Evt.from"`);
    typeSafety_1.assert(inDepth_1.same(parsedImportExportStatement, {
        "isAsyncImport": false,
        "parsedArgument": {
            "type": "PROJECT LOCAL FILE",
            "relativePath": "./Evt.from"
        },
        "isTypeOnly": false,
        "quoteSymbol": '"',
        "statementType": "import",
        "target": "{ from }"
    }));
    typeSafety_1.assert(ParsedImportExportStatement_1.ParsedImportExportStatement.stringify(parsedImportExportStatement)
        ===
            `import { from } from "./Evt.from"`);
    console.log("PASS");
}
//# sourceMappingURL=parsedImportExportStatement.js.map