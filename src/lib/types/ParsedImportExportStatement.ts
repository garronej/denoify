
import { id } from "evt/tools/typeSafety";


export type ParsedImportExportStatement =
    ParsedImportExportStatement.Regular |
    ParsedImportExportStatement.Async;

export namespace ParsedImportExportStatement {

    export type _Common = {
        quoteSymbol: "\"" | "'";
        argument: string;
    };

    export type Async = _Common & {
        isAsyncImport: true;
    };

    export type Regular = Regular.Export | Regular.Import;

    export namespace Regular {

        export type _Common = ParsedImportExportStatement._Common & {
            isAsyncImport: false;
        };

        export type Export = _Common & {
            statementType: "export";
            target: string;
            isTypeOnly: boolean;
        };

        export type Import = Import.WithTarget | Import.WithoutTarget;

        export namespace Import {

            export type _Common = Regular._Common & {
                statementType: "import";
            };

            export type WithTarget = _Common & {
                target: string;
                isTypeOnly: boolean;
            };

            export type WithoutTarget = _Common & {
                target: undefined;
            };

        }

    }

}

export namespace ParsedImportExportStatement {

    export function parse(
        importExportStatement: string
    ): ParsedImportExportStatement {

        importExportStatement =
            importExportStatement
                .replace(/\s+^/, "")
                .replace(/$\s+/, "")
            ;

        const isAsyncImport = importExportStatement
            .endsWith(")");

        const quoteSymbol = importExportStatement
            .endsWith(`'${isAsyncImport ? ")" : ""}`) ? "'" : "\""


        const argument = importExportStatement.match(
            new RegExp(`^[^${quoteSymbol}]*${quoteSymbol}([^${quoteSymbol}]+)${quoteSymbol}[^${quoteSymbol}]*$`)
        )![1];

        if (isAsyncImport) {

            return id<ParsedImportExportStatement.Async>({
                "isAsyncImport": true,
                quoteSymbol,
                argument
            });

        }

        if ((new RegExp(`^import\\s+${quoteSymbol}`)).test(importExportStatement)) {

            return id<ParsedImportExportStatement.Regular.Import.WithoutTarget>({
                argument,
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

        const target =
            importExportStatement.match(
                new RegExp(`^(?:import|export)(?:\\s+type)?\\s*([^${quoteSymbol}]+)${quoteSymbol}`)
            )![1]
                .replace(/\s*from\s*/, "");

        return id<
            ParsedImportExportStatement.Regular.Import.WithTarget |
            ParsedImportExportStatement.Regular.Export
        >({
            "isAsyncImport": false,
            argument,
            isTypeOnly,
            quoteSymbol,
            statementType,
            target
        });

    }

    export function stringify(
        parsedImportExportStatement: ParsedImportExportStatement
    ): string {

        const { quoteSymbol, argument } = parsedImportExportStatement;

        const quotedArgument = `${quoteSymbol}${argument}${quoteSymbol}`;

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


}
