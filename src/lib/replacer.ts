import { assert, is } from "tsafe";
import * as st from "scripting-tools";
import { addCache } from "../tools/addCache";

import { ParsedImportExportStatement as ParsedImportExportStatementExhaustive } from "./types/ParsedImportExportStatement";

export type ParsedImportExportStatement<Type extends "DEPENDENCY" | "URL"> = Exclude<ParsedImportExportStatementExhaustive, "parsedArgument"> & {
    parsedArgument: Type extends "DEPENDENCY"
        ? ParsedImportExportStatementExhaustive.ParsedArgument.Dependency
        : ParsedImportExportStatementExhaustive.ParsedArgument.Url;
};

export namespace ParsedImportExportStatement {
    export const stringify: (parsedImportExportStatement: ParsedImportExportStatement<"URL">) => string =
        ParsedImportExportStatementExhaustive.stringify;
}

export type Replacer = (params: {
    importExportStatement: string;
    parsedImportExportStatement: ParsedImportExportStatement<"DEPENDENCY">;
    version: string;
    destDirPath: string;
}) => Promise<undefined | string>;

const exitCodeForUndefined = 153;
const separatorBetweenDebugAndResult = "\n===========>> | REPLACER RESULT | <<===========\n";

/**
 * Assert the replacer never throws, if you do not want to override
 * the normal module resolution just return undefined.
 */
export async function makeThisModuleAnExecutableReplacer(replacer: Replacer): Promise<never> {
    process.once("unhandledRejection", error => {
        throw error;
    });

    let [, , importExportStatement, version, destDirPath] = process.argv;

    assert(typeof version !== undefined, `expect: node ${process.argv[1]} '<importExportStatement>' <version>`);

    const parsedImportExportStatement = ParsedImportExportStatementExhaustive.parse(JSON.parse(`"${importExportStatement.replace(/"/g, '\\"')}"`));

    assert(parsedImportExportStatement.parsedArgument.type === "DEPENDENCY");

    //NOTE: Should be inferable...
    assert(is<ParsedImportExportStatement<"DEPENDENCY">>(parsedImportExportStatement));

    const result = await replacer({
        parsedImportExportStatement,
        importExportStatement,
        version,
        destDirPath
    });

    if (result === undefined) {
        process.exit(exitCodeForUndefined);
    }

    process.stdout.write(separatorBetweenDebugAndResult + result);

    process.exit(0);
}

export function consumeExecutableReplacerFactory(params: { executableFilePath: string }) {
    const { executableFilePath } = params;

    const consumeExecutableReplacer = addCache(
        async (params: {
            parsedImportExportStatement: ParsedImportExportStatement<"DEPENDENCY">;
            version: string;
            destDirPath: string;
        }): Promise<string | undefined> => {
            const { parsedImportExportStatement, version, destDirPath } = params;

            let out: string;

            try {
                out = await st.exec(
                    `"${process.argv[0]}" "${executableFilePath}" ${JSON.stringify(
                        ParsedImportExportStatementExhaustive.stringify(parsedImportExportStatement)
                    )} ${version} ${JSON.stringify(destDirPath)}`
                );
            } catch (error) {
                assert(is<Error & { code: number }>(error));

                if (error.code === exitCodeForUndefined) {
                    return undefined;
                }

                throw error;
            }

            const [debugLog, result] = out.split(separatorBetweenDebugAndResult);

            if (debugLog) {
                process.stdout.write(debugLog);
            }

            return result;
        }
    );

    return { consumeExecutableReplacer };
}
