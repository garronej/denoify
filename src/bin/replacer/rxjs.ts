import type { Replacer } from "../../lib";
import { Version } from "../../tools/Version";

const moduleName = "rxjs";

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

    switch (parsedImportExportStatement.parsedArgument.specificImportPath) {
        case undefined: {
            const commit = "07a52c868823928b792e870a572b24af36a4b665";

            return [
                ...(Version.parse(version).major === 6
                    ? [`// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/${commit}/rxjs/v6.5.5/rxjs.d.ts"`]
                    : []),
                `import ${parsedImportExportStatement.target} from "https://cdn.skypack.dev/rxjs@${version}";`
            ].join("\n");
        }
        case "operators": {
            const { target } = parsedImportExportStatement;

            const url = `https://dev.jspm.io/rxjs@${version}/operators`;

            if (target === undefined) {
                //NOTE: More certainly useless to import like that
                return `import "${url}";`;
            }

            const commit = "07a52c868823928b792e870a572b24af36a4b665";

            return [
                ...(Version.parse(version).major === 6
                    ? [`// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/${commit}/rxjs/v6.5.5/operators.d.ts"`]
                    : []),
                ...(() => {
                    walk: {
                        const match = target.match(/^\*\s+as\s+(.*)$/);

                        if (!match) {
                            break walk;
                        }

                        return [`import ${match[1]} from "${url}";`];
                    }

                    walk: {
                        if (!/^{[^}]+}$/.test(target)) {
                            break walk;
                        }

                        return [`import __rxjs_operators_ns from "${url}";`, `const ${target} = __rxjs_operators_ns;`];
                    }

                    walk: {
                        if (target.includes(",")) {
                            break walk;
                        }

                        return [`import ${target} from "${url}";`];
                    }

                    throw new Error(`Importing ${moduleName} as ${target} is not supported, (split in multiple import)`);
                })()
            ].join("\n");
        }
        case "webSocket": {
            const { target } = parsedImportExportStatement;

            const url = `https://cdn.skypack.dev/rxjs@${version}/webSocket?dts`;

            if (target === undefined) {
                //NOTE: More certainly useless to import like that
                return `import "${url}";`;
            }

            return `import ${target} from "${url}";`;
        }
        default:
            throw new Error(`Only support import from "${moduleName}", "${moduleName}/operators", or "${moduleName}/webSocket`);
    }
};
