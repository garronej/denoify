import type { Replacer } from "../../lib";

const moduleName = "ipaddr.js";

//NOTE: Type definitions not imported.
export const replacer: Replacer = async params => {
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

    if (parsedImportExportStatement.statementType === "declare module") {
        throw new Error(`TODO, module augmentation for ${moduleName} not supported`);
    }

    const match = parsedImportExportStatement.target?.match(/^\*\s+as\s+(.*)$/);

    if (!match) {
        throw new Error(`expect import ${moduleName} as a namespace`);
    }

    //NOTE: Cosmetic, we could use " or '
    const qs = parsedImportExportStatement.quoteSymbol;

    return `import ${match[1]} from ${qs}https://jspm.dev/ipaddr.js@${version}${qs}`;
};
