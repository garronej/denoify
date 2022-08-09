import type { Replacer } from "../../lib";
import { ParsedImportExportStatement } from "../../lib/types/ParsedImportExportStatement";

const moduleName = "react";

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

    //const commit = "eb9b173f015a13569aa6dd5bee78bac2e43a14db";

    return [
        /*
        TODO: Error when importing types of React and the types React DOM.
        error: TS2300 [ERROR]: Duplicate identifier 'LibraryManagedAttributes'.
        type LibraryManagedAttributes<C, P> = C extends
         ~~~~~~~~~~~~~~~~~~~~~~~~
        at https://raw.githubusercontent.com/Soremwar/deno_types/eb9b173f015a13569aa6dd5bee78bac2e43a14db/react/v16.13.1/react.d.ts:3294:10
        */
        //`// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/${commit}/react/v16.13.1/react.d.ts"`,
        `import ${target} from "https://dev.jspm.io/react@${version}";`
    ].join("\n");
};
