import { ParsedImportExportStatement as ParsedImportExportStatementExhaustive } from "./types/ParsedImportExportStatement";
export declare type ParsedImportExportStatement<Type extends "DEPENDENCY" | "URL"> = Exclude<ParsedImportExportStatementExhaustive, "parsedArgument"> & {
    parsedArgument: Type extends "DEPENDENCY" ? ParsedImportExportStatementExhaustive.ParsedArgument.Dependency : ParsedImportExportStatementExhaustive.ParsedArgument.Url;
};
export declare namespace ParsedImportExportStatement {
    const stringify: (parsedImportExportStatement: ParsedImportExportStatement<"URL">) => string;
}
export declare type Replacer = (params: {
    importExportStatement: string;
    parsedImportExportStatement: ParsedImportExportStatement<"DEPENDENCY">;
    version: string;
    destDirPath: string;
}) => Promise<undefined | string>;
/**
 * Assert the replacer never throws, if you do not want to override
 * the normal module resolution just return undefined.
 */
export declare function makeThisModuleAnExecutableReplacer(replacer: Replacer): Promise<never>;
export declare function consumeExecutableReplacerFactory(params: {
    executableFilePath: string;
}): {
    consumeExecutableReplacer: (params: {
        parsedImportExportStatement: ParsedImportExportStatement<"DEPENDENCY">;
        version: string;
        destDirPath: string;
    }) => Promise<string | undefined>;
};
