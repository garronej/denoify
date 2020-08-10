export declare type ParsedImportExportStatement = ParsedImportExportStatement.Regular | ParsedImportExportStatement.Async;
export declare namespace ParsedImportExportStatement {
    type _Common = {
        quoteSymbol: "\"" | "'";
        parsedArgument: ParsedArgument;
    };
    type ParsedArgument = ParsedArgument.Local | ParsedArgument.Dependency | ParsedArgument.Url;
    namespace ParsedArgument {
        type Local = {
            type: "PROJECT LOCAL FILE";
            relativePath: string;
        };
        type Dependency = {
            type: "DEPENDENCY";
            nodeModuleName: string;
            specificImportPath: string | undefined;
        };
        type Url = {
            type: "URL";
            url: string;
        };
        function parse(argument: string): ParsedArgument;
        function stringify(parsedArgument: ParsedArgument): string;
    }
    type Async = _Common & {
        isAsyncImport: true;
    };
    type Regular = Regular.Export | Regular.Import;
    namespace Regular {
        type _Common = ParsedImportExportStatement._Common & {
            isAsyncImport: false;
        };
        type Export = _Common & {
            statementType: "export";
            target: string;
            isTypeOnly: boolean;
        };
        type Import = Import.WithTarget | Import.WithoutTarget;
        namespace Import {
            type _Common = Regular._Common & {
                statementType: "import";
            };
            type WithTarget = _Common & {
                target: string;
                isTypeOnly: boolean;
            };
            type WithoutTarget = _Common & {
                target: undefined;
            };
        }
    }
    function parse(importExportStatement: string): ParsedImportExportStatement;
    function stringify(parsedImportExportStatement: ParsedImportExportStatement): string;
}
