"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replacer = void 0;
const lib_1 = require("../../lib");
const moduleName = "graphql";
exports.replacer = async (params) => {
    const { parsedImportExportStatement, version } = params;
    if (parsedImportExportStatement.parsedArgument.nodeModuleName !== moduleName) {
        return undefined;
    }
    return lib_1.ParsedImportExportStatement.stringify({
        ...parsedImportExportStatement,
        "parsedArgument": {
            "type": "URL",
            "url": `https://cdn.skypack.dev/graphql@${version}?dts`
        },
    });
};
//# sourceMappingURL=graphql.js.map