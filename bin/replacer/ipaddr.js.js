"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replacer = void 0;
//NOTE: Type definitions not imported.
exports.replacer = async (params) => {
    var _a;
    const { parsedImportExportStatement, version } = params;
    if (parsedImportExportStatement.parsedArgument.nodeModuleName !== "ipaddr.js") {
        return undefined;
    }
    if (parsedImportExportStatement.isAsyncImport) {
        throw new Error("TODO, async import of ipaddr.js not supported yet");
    }
    if (parsedImportExportStatement.statementType === "export") {
        throw new Error("TODO, exporting from ipaddr.js is not supported yet");
    }
    const match = (_a = parsedImportExportStatement.target) === null || _a === void 0 ? void 0 : _a.match(/^\*\s+as\s+(.*)$/);
    if (!match) {
        throw new Error("expect import ipaddr.js as a namespace");
    }
    //NOTE: Cosmetic, we could use " or '
    const qs = parsedImportExportStatement.quoteSymbol;
    return `import ${match[1]} from ${qs}https://jspm.dev/ipaddr.js@${version}${qs}`;
};
//# sourceMappingURL=ipaddr.js.js.map