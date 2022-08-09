import type { Replacer } from "../../lib";
import { ParsedImportExportStatement } from "../../lib/types/ParsedImportExportStatement";

const moduleName = "react-dom";

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

    const target = (() => {
        const { target } = parsedImportExportStatement;

        if (!target) {
            throw new Error(`Importing ${moduleName} without target?`);
        }

        const match = target.match(/^\*\s+as\s+(.*)$/);

        if (!!match) {
            return match[1];
        }

        if (target.includes("{")) {
            const importArg = ParsedImportExportStatement.ParsedArgument.stringify(parsedImportExportStatement.parsedArgument);

            throw new Error(`Use: 
            Instead of importing ${moduleName} like that: 
            import ${target} from "${importArg}" 
            You must import it like this: 
            import * as Xxx from "${importArg}" 
            or 
            import Xxx from "${importArg}" 
            then extract what you need from the default export.
            ( The denoify parser for ${moduleName} import is not very sophisticated )
            `);
        }

        return target;
    })();

    switch (parsedImportExportStatement.parsedArgument.specificImportPath) {
        case undefined: {
            const commit = "02774811084fd4a85d91f73d27deffff2c6b8d02";

            return [
                `// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/${commit}/react-dom/v16.13.1/react-dom.d.ts"`,
                `import ${target} from "https://cdn.skypack.dev/react-dom@${version}";`
            ].join("\n");
        }
        case "server": {
            const commit = "df2a75e38bf52fa0bf4bd29cd790478e3011fc0f";

            return [
                `// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/${commit}/react-dom/v16.13.1/server.d.ts"`,
                `import ${target} from "https://dev.jspm.io/react-dom@${version}/server.js";`
            ].join("\n");
        }
        default:
            throw new Error(`Only support import from "${moduleName}" or "${moduleName}/server"`);
    }
};
