"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replacer = void 0;
const moduleName = "react";
//NOTE: Type definitions not imported.
exports.replacer = async (params) => {
    const { parsedImportExportStatement, version } = params;
    if (parsedImportExportStatement.parsedArgument.nodeModuleName !== moduleName) {
        return undefined;
    }
    if (parsedImportExportStatement.isAsyncImport) {
        throw new Error(`TODO, async import of ${moduleName} not supported yet`);
    }
    if (parsedImportExportStatement.statementType === "export") {
        throw new Error(`TODO, exporting from ${moduleName} is not supported yet`);
    }
    const { target } = parsedImportExportStatement;
    if (target === undefined ||
        target.includes("{") ||
        target.includes("*")) {
        throw new Error(`Only support importing default export of ${moduleName}`);
    }
    return [
        `// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/eb9b173f015a13569aa6dd5bee78bac2e43a14db/react/v16.13.1/react.d.ts"`,
        `import ${target} from "https://dev.jspm.io/react@${version}";`
    ].join("\n");
};
//# sourceMappingURL=react.js.map