
import { assert, typeGuard } from "evt/tools/typeSafety";
import * as st from "scripting-tools";
import { addCache } from "../tools/addCache";


import {
    ParsedImportExportStatement as ParsedImportExportStatementExhaustive
} from "./types/ParsedImportExportStatement";

export type ParsedImportExportStatement<Type extends "DEPENDENCY" | "URL"> =
    Exclude<ParsedImportExportStatementExhaustive, "parsedArgument"> &
    {
        parsedArgument: Type extends "DEPENDENCY" ?
        ParsedImportExportStatementExhaustive.ParsedArgument.Dependency :
        ParsedImportExportStatementExhaustive.ParsedArgument.Url
    }
    ;


export namespace ParsedImportExportStatement {

    export const stringify: (parsedImportExportStatement: ParsedImportExportStatement<"URL">) => string =
        ParsedImportExportStatementExhaustive.stringify;

}

export type Replacer = (
    params: {
        importExportStatement: string,
        parsedImportExportStatement: ParsedImportExportStatement<"DEPENDENCY">;
        version: string;
    }
) => Promise<undefined | string>;

const errorCodeForUndefined = 153;

/** 
 * Assert the replacer never throws, if you do not want to override 
 * the normal module resolution just return undefined.
 */
export async function makeThisModuleAnExecutableReplacer(replacer: Replacer): Promise<never> {

    process.once("unhandledRejection", error => { throw error; });

    const [,, importExportStatement, version] = process.argv;

    assert(
        typeof version !== undefined,
        `expect: node ${process.argv[1]} '<importExportStatement>' <version>`
    );

    const parsedImportExportStatement = ParsedImportExportStatementExhaustive.parse(importExportStatement);

    assert(parsedImportExportStatement.parsedArgument.type === "DEPENDENCY");

    //NOTE: Should be inferable...
    assert(typeGuard<ParsedImportExportStatement<"DEPENDENCY">>(parsedImportExportStatement));

    const result = await replacer({
        parsedImportExportStatement,
        importExportStatement,
        version
    });

    if (result === undefined) {

        process.exit(errorCodeForUndefined);

    }


    process.stdout.write(result);

    process.exit(0);

}

export function consumeExecutableReplacerFactory(
    params: {
        filePath: string;
    }
) {

    const { filePath } = params;

    const consumeExecutableReplacer = addCache(
        async (
            params: {
                parsedImportExportStatement: ParsedImportExportStatement<"DEPENDENCY">;
                version: string;
            }
        ): Promise<string | undefined> => {

            const { parsedImportExportStatement, version } = params;

            try {

                return await st.exec(
                    `${
                    process.argv[0]
                    } ${
                    filePath
                    } ${
                    JSON.stringify(
                        ParsedImportExportStatementExhaustive.stringify(
                            parsedImportExportStatement
                        )
                    )
                    } ${
                    version
                    }`
                );

            } catch (error) {

                if (error.code === errorCodeForUndefined) {
                    return undefined;
                }

                throw error;

            }

        });

    return { consumeExecutableReplacer };

}

