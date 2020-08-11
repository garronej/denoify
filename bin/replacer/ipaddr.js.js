"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replacer = void 0;
const lib_1 = require("../../lib");
exports.replacer = async (params) => {
    var _a;
    const { parsedImportExportStatement, version } = params;
    if (parsedImportExportStatement.parsedArgument.nodeModuleName !== "ipaddr.js") {
        return undefined;
    }
    const firstVersionWithType = "1.6.0";
    const typeVersion = lib_1.Version.compare(lib_1.Version.parse(version), lib_1.Version.parse(firstVersionWithType)) <= 0 ?
        firstVersionWithType :
        version;
    const urlTypes = `https://raw.githubusercontent.com/whitequark/ipaddr.js/v${typeVersion}/lib/ipaddr.js.d.ts`;
    if (await lib_1.is404(urlTypes)) {
        if (version === firstVersionWithType) {
            //It would means that the repo have been removed.
            return undefined;
        }
        return exports.replacer({ ...params, "version": firstVersionWithType });
    }
    if (parsedImportExportStatement.isAsyncImport) {
        throw new Error("TODO, async import of ipaddr.js not supported");
    }
    const match = (_a = parsedImportExportStatement.target) === null || _a === void 0 ? void 0 : _a.match(/^\*\s+as\s+(.*)$/);
    if (!match) {
        throw new Error("expect import ipaddr.js as a namespace");
    }
    const parsedImportExportStatementOut = {
        ...parsedImportExportStatement,
        "parsedArgument": {
            "type": "URL",
            "url": `https://jspm.dev/ipaddr.js@${version}`
        }
    };
    parsedImportExportStatementOut.target = match[1];
    return [
        `// @deno-types="${urlTypes}"`,
        lib_1.ParsedImportExportStatement.stringify(parsedImportExportStatementOut)
    ].join("\n");
};
//# sourceMappingURL=ipaddr.js.js.map