"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedImportExportStatement = void 0;
const typeSafety_1 = require("evt/tools/typeSafety");
var ParsedImportExportStatement;
(function (ParsedImportExportStatement) {
    let ParsedArgument;
    (function (ParsedArgument) {
        function parse(argument) {
            if (argument.startsWith(".")) {
                return typeSafety_1.id({
                    "type": "PROJECT LOCAL FILE",
                    "relativePath": argument
                });
            }
            if (/^(https?:)?\/\//i.test(argument)) {
                return typeSafety_1.id({
                    "type": "URL",
                    "url": argument
                });
            }
            {
                const [nodeModuleName, ...rest] = argument.split("/");
                return typeSafety_1.id({
                    "type": "DEPENDENCY",
                    nodeModuleName,
                    "specificImportPath": rest.join("/") || undefined
                });
            }
        }
        ParsedArgument.parse = parse;
        function stringify(parsedArgument) {
            switch (parsedArgument.type) {
                case "PROJECT LOCAL FILE": return parsedArgument.relativePath;
                case "DEPENDENCY":
                    {
                        const { nodeModuleName, specificImportPath } = parsedArgument;
                        return `${nodeModuleName}${specificImportPath ? `/${specificImportPath}` : ``}`;
                    }
                    ;
                case "URL": return parsedArgument.url;
            }
        }
        ParsedArgument.stringify = stringify;
    })(ParsedArgument = ParsedImportExportStatement.ParsedArgument || (ParsedImportExportStatement.ParsedArgument = {}));
    function parse(importExportStatement) {
        importExportStatement =
            importExportStatement
                .replace(/\s+^/, "")
                .replace(/$\s+/, "");
        const isAsyncImport = importExportStatement
            .endsWith(")");
        const quoteSymbol = importExportStatement
            .endsWith(`'${isAsyncImport ? ")" : ""}`) ? "'" : "\"";
        const parsedArgument = ParsedImportExportStatement.ParsedArgument.parse(importExportStatement.match(new RegExp(`^[^${quoteSymbol}]*${quoteSymbol}([^${quoteSymbol}]+)${quoteSymbol}[^${quoteSymbol}]*$`))[1]);
        if (isAsyncImport) {
            return typeSafety_1.id({
                "isAsyncImport": true,
                quoteSymbol,
                parsedArgument
            });
        }
        if ((new RegExp(`^import\\s+${quoteSymbol}`)).test(importExportStatement)) {
            return typeSafety_1.id({
                parsedArgument,
                isAsyncImport: false,
                quoteSymbol,
                "statementType": "import",
                "target": undefined
            });
        }
        const statementType = importExportStatement
            .startsWith("import") ?
            "import" : "export";
        const isTypeOnly = /^(?:import|export)\s+type/
            .test(importExportStatement);
        const target = importExportStatement.match(new RegExp(`^(?:import|export)(?:\\s+type)?\\s*([^${quoteSymbol}]+)${quoteSymbol}`))[1]
            .replace(/\s*from\s*$/, "");
        return typeSafety_1.id({
            "isAsyncImport": false,
            parsedArgument,
            isTypeOnly,
            quoteSymbol,
            statementType,
            target
        });
    }
    ParsedImportExportStatement.parse = parse;
    function stringify(parsedImportExportStatement) {
        const { quoteSymbol, parsedArgument } = parsedImportExportStatement;
        const quotedArgument = `${quoteSymbol}${ParsedImportExportStatement.ParsedArgument.stringify(parsedArgument)}${quoteSymbol}`;
        if (parsedImportExportStatement.isAsyncImport) {
            return `import(${quotedArgument})`;
        }
        if (parsedImportExportStatement.target === undefined) {
            return `import ${quotedArgument}`;
        }
        const { statementType, isTypeOnly, target } = parsedImportExportStatement;
        return [
            statementType,
            ...(isTypeOnly ? ["type"] : []),
            target,
            "from",
            quotedArgument
        ].join(" ");
    }
    ParsedImportExportStatement.stringify = stringify;
})(ParsedImportExportStatement = exports.ParsedImportExportStatement || (exports.ParsedImportExportStatement = {}));
//# sourceMappingURL=ParsedImportExportStatement.js.map