import type { Replacer } from "../..";
import { ParsedImportExportStatement } from "../..";

const moduleName = "graphql";

export const replacer: Replacer = async params => {
    const { parsedImportExportStatement, version } = params;

    if (parsedImportExportStatement.parsedArgument.nodeModuleName !== moduleName) {
        return undefined;
    }

    return ParsedImportExportStatement.stringify({
        ...parsedImportExportStatement,
        "parsedArgument": {
            "type": "URL",
            "url": `https://cdn.skypack.dev/graphql@${version}?dts`
        }
    });
};
