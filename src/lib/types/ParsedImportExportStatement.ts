import { id } from "tsafe";

export type ParsedImportExportStatement = ParsedImportExportStatement.Regular | ParsedImportExportStatement.Async;

export namespace ParsedImportExportStatement {
    export type _Common = {
        quoteSymbol: '"' | "'";
        parsedArgument: ParsedArgument;
    };

    export type ParsedArgument = ParsedArgument.Local | ParsedArgument.Dependency | ParsedArgument.Url;

    export namespace ParsedArgument {
        export type Local = {
            type: "PROJECT LOCAL FILE";
            relativePath: string;
        };

        export type Dependency = {
            type: "DEPENDENCY";
            nodeModuleName: string;
            specificImportPath: string | undefined;
        };

        export type Url = {
            type: "URL";
            url: string;
        };

        export function parse(argument: string): ParsedArgument {
            if (argument.startsWith(".")) {
                return id<Local>({
                    "type": "PROJECT LOCAL FILE",
                    "relativePath": argument
                });
            }

            if (/^(https?:)?\/\//i.test(argument)) {
                return id<Url>({
                    "type": "URL",
                    "url": argument
                });
            }

            {
                let [nodeModuleName, ...rest] = argument.split("/");

                if (nodeModuleName.startsWith("@") && rest.length !== 0) {
                    const [scopedNodeModuleName, ...restNew] = rest;

                    nodeModuleName = `${nodeModuleName}/${scopedNodeModuleName}`;

                    rest = restNew;
                }

                return id<Dependency>({
                    "type": "DEPENDENCY",
                    nodeModuleName,
                    "specificImportPath": rest.join("/") || undefined
                });
            }
        }

        export function stringify(parsedArgument: ParsedArgument): string {
            switch (parsedArgument.type) {
                case "PROJECT LOCAL FILE":
                    return parsedArgument.relativePath;
                case "DEPENDENCY": {
                    const { nodeModuleName, specificImportPath } = parsedArgument;

                    return `${nodeModuleName}${specificImportPath ? `/${specificImportPath}` : ``}`;
                }
                case "URL":
                    return parsedArgument.url;
            }
        }
    }

    export type Async = _Common & {
        isAsyncImport: true;
    };

    export type Regular = Regular.Export | Regular.Import | Regular.DeclareModule;

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

        export type DeclareModule = _Common & {
            statementType: "declare module";
        };
    }

    export function parse(importExportStatement: string): ParsedImportExportStatement {
        importExportStatement = importExportStatement.replace(/\s+^/, "").replace(/$\s+/, "");

        const isAsyncImport = importExportStatement.endsWith(")");

        const quoteSymbol = importExportStatement.endsWith(`'${isAsyncImport ? ")" : ""}`) ? "'" : '"';

        const parsedArgument = ParsedImportExportStatement.ParsedArgument.parse(
            importExportStatement.match(new RegExp(`^[^${quoteSymbol}]*${quoteSymbol}([^${quoteSymbol}]+)${quoteSymbol}[^${quoteSymbol}]*$`))![1]
        );

        if (isAsyncImport) {
            return id<ParsedImportExportStatement.Async>({
                "isAsyncImport": true,
                quoteSymbol,
                parsedArgument
            });
        }

        if (new RegExp(`^declare\\s+module\\s+${quoteSymbol}`).test(importExportStatement)) {
            return id<ParsedImportExportStatement.Regular.DeclareModule>({
                parsedArgument,
                "isAsyncImport": false,
                quoteSymbol,
                "statementType": "declare module"
            });
        }

        if (new RegExp(`^import\\s+${quoteSymbol}`).test(importExportStatement)) {
            return id<ParsedImportExportStatement.Regular.Import.WithoutTarget>({
                parsedArgument,
                "isAsyncImport": false,
                quoteSymbol,
                "statementType": "import",
                "target": undefined
            });
        }

        const statementType = importExportStatement.startsWith("import") ? "import" : "export";

        const isTypeOnly = /^(?:import|export)\s+type/.test(importExportStatement);

        const target = importExportStatement
            .match(new RegExp(`^(?:import|export)(?:\\s+type)?\\s*([^${quoteSymbol}]+)${quoteSymbol}`))![1]
            .replace(/\s*from\s*$/, "");

        return id<ParsedImportExportStatement.Regular.Import.WithTarget | ParsedImportExportStatement.Regular.Export>({
            "isAsyncImport": false,
            parsedArgument,
            isTypeOnly,
            quoteSymbol,
            statementType,
            target
        });
    }

    export function stringify(parsedImportExportStatement: ParsedImportExportStatement): string {
        const { quoteSymbol, parsedArgument } = parsedImportExportStatement;

        const quotedArgument = `${quoteSymbol}${ParsedImportExportStatement.ParsedArgument.stringify(parsedArgument)}${quoteSymbol}`;

        if (parsedImportExportStatement.isAsyncImport) {
            return `import(${quotedArgument})`;
        }

        if (parsedImportExportStatement.statementType === "declare module") {
            return `declare module ${quotedArgument}`;
        }

        if (parsedImportExportStatement.target === undefined) {
            return `import ${quotedArgument}`;
        }

        const { statementType, isTypeOnly, target } = parsedImportExportStatement;

        return [statementType, ...(isTypeOnly ? ["type"] : []), target, "from", quotedArgument].join(" ");
    }
}
