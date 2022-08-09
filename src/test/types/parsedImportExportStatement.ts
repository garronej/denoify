import { ParsedImportExportStatement } from "../../lib/types/ParsedImportExportStatement";
import { same } from "evt/tools/inDepth";
import { assert } from "tsafe";

{
    const parsedImportExportStatement = ParsedImportExportStatement.parse('import \n\n    * as _ \n\nfrom \n\n"xxx"');

    assert(
        same(parsedImportExportStatement, {
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
        })
    );

    assert(ParsedImportExportStatement.stringify(parsedImportExportStatement) === `import * as _ from "xxx"`);
}

{
    const parsedImportExportStatement = ParsedImportExportStatement.parse('import * as foobar from "xxx"');

    assert(
        same(parsedImportExportStatement, {
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
        })
    );

    assert(ParsedImportExportStatement.stringify(parsedImportExportStatement) === `import * as foobar from "xxx"`);
}

{
    const parsedImportExportStatement = ParsedImportExportStatement.parse('import * as d from "xxx"');

    assert(
        same(parsedImportExportStatement, {
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
        })
    );

    assert(ParsedImportExportStatement.stringify(parsedImportExportStatement) === `import * as d from "xxx"`);
}

{
    const parsedImportExportStatement = ParsedImportExportStatement.parse('import { } from "xxx"');

    assert(
        same(parsedImportExportStatement, {
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
        })
    );

    assert(ParsedImportExportStatement.stringify(parsedImportExportStatement) === `import { } from "xxx"`);
}

{
    const parsedImportExportStatement = ParsedImportExportStatement.parse('import "xxx"');

    assert(
        same(parsedImportExportStatement, {
            "parsedArgument": {
                "type": "DEPENDENCY",
                "nodeModuleName": "xxx",
                "specificImportPath": undefined
            },
            "isAsyncImport": false,
            "quoteSymbol": '"',
            "statementType": "import",
            "target": undefined
        })
    );

    assert(ParsedImportExportStatement.stringify(parsedImportExportStatement) === `import "xxx"`);
}

{
    const parsedImportExportStatement = ParsedImportExportStatement.parse(' import("xxx")');

    assert(
        same(parsedImportExportStatement, {
            "isAsyncImport": true,
            "quoteSymbol": '"',
            "parsedArgument": {
                "type": "DEPENDENCY",
                "nodeModuleName": "xxx",
                "specificImportPath": undefined
            },
            "target": undefined
        })
    );

    assert(ParsedImportExportStatement.stringify(parsedImportExportStatement) === `import("xxx")`);
}

{
    const parsedImportExportStatement = ParsedImportExportStatement.parse("import * as foo from 'xxx'");

    assert(
        same(parsedImportExportStatement, {
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
        })
    );

    assert(ParsedImportExportStatement.stringify(parsedImportExportStatement) === `import * as foo from \'xxx\'`);
}

{
    const parsedImportExportStatement = ParsedImportExportStatement.parse("import type * as foo from 'xxx'");

    assert(
        same(parsedImportExportStatement, {
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
        })
    );

    assert(ParsedImportExportStatement.stringify(parsedImportExportStatement) === "import type * as foo from 'xxx'");
}

{
    const parsedImportExportStatement = ParsedImportExportStatement.parse("import type  { Cat } from 'xxx'");

    assert(
        same(parsedImportExportStatement, {
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
        })
    );

    assert(ParsedImportExportStatement.stringify(parsedImportExportStatement) === "import type { Cat } from 'xxx'");
}

{
    const parsedImportExportStatement = ParsedImportExportStatement.parse(`import { from } from "./Evt.from"`);

    assert(
        same(parsedImportExportStatement, {
            "isAsyncImport": false,
            "parsedArgument": {
                "type": "PROJECT LOCAL FILE",
                "relativePath": "./Evt.from"
            },
            "isTypeOnly": false,
            "quoteSymbol": '"',
            "statementType": "import",
            "target": "{ from }"
        })
    );

    assert(ParsedImportExportStatement.stringify(parsedImportExportStatement) === `import { from } from "./Evt.from"`);
}

{
    const importStatement = `import { useEvt } from "evt/hooks/useEvt"`;

    const parsedImportExportStatement = ParsedImportExportStatement.parse(importStatement);

    assert(
        same(parsedImportExportStatement, {
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
        })
    );

    assert(ParsedImportExportStatement.stringify(parsedImportExportStatement) === importStatement);
}

{
    const importStatement = `import { DefaultAzureCredential, ClientSecretCredential, } from '@azure/identity'`;

    const parsedImportExportStatement = ParsedImportExportStatement.parse(importStatement);

    assert(
        same(parsedImportExportStatement, {
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
        })
    );

    assert(ParsedImportExportStatement.stringify(parsedImportExportStatement) === importStatement);
}

console.log("PASS");
