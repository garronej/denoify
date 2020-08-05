"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const denoifyImportExportStatement_1 = require("../lib/denoifyImportExportStatement");
const path = require("path");
const typeSafety_1 = require("evt/tools/typeSafety");
const userProvidedReplacerPath = path.join(__dirname, "..", "bin", "replacer", "index.js");
(async () => {
    for (const sep of [`"`, `'`]) {
        const { denoifyImportExportStatement } = denoifyImportExportStatement_1.denoifyImportExportStatementFactory({
            "resolveNodeModuleToDenoModule": () => { throw new Error("never"); },
            "getInstalledVersionPackageJson": async ({ nodeModuleName }) => {
                if (nodeModuleName !== "ipaddr.js") {
                    throw new Error("never");
                }
                return {
                    "version": "1.1.0",
                    "repository": { "url": "git://github.com/whitequark/ipaddr.js.git" }
                };
            },
            userProvidedReplacerPath
        });
        typeSafety_1.assert(await denoifyImportExportStatement({
            "fileDirPath": "irrelevant here...",
            "importExportStatement": `import ipaddr from ${sep}ipaddr.js${sep}`
        }), [
            `// @deno-types=${sep}https://raw.githubusercontent.com/whitequark/ipaddr.js/v1.6.0/lib/ipaddr.js.d.ts${sep}`,
            `import ipaddr from ${sep}https://raw.githubusercontent.com/whitequark/ipaddr.js/v1.1.0/lib/ipaddr.js${sep}`
        ].join("\n"));
    }
    {
        const { denoifyImportExportStatement } = denoifyImportExportStatement_1.denoifyImportExportStatementFactory({
            "resolveNodeModuleToDenoModule": () => { throw new Error("never"); },
            "getInstalledVersionPackageJson": async () => { throw new Error("never"); },
            userProvidedReplacerPath
        });
        const importExportStatement = 'import ipaddr from "https://jspm.dev/ipaddr.js"';
        typeSafety_1.assert(await denoifyImportExportStatement({
            "fileDirPath": "irrelevant here...",
            importExportStatement
        }), importExportStatement);
    }
    const { denoifyImportExportStatement } = denoifyImportExportStatement_1.denoifyImportExportStatementFactory({
        "resolveNodeModuleToDenoModule": async ({ nodeModuleName }) => {
            typeSafety_1.assert(nodeModuleName === "foo");
            return {
                "result": "SUCCESS",
                "getValidImportUrl": async (params) => {
                    typeSafety_1.assert(params.target === "SPECIFIC FILE");
                    return `https://example.fr/foo/${params.specificImportPath}`;
                }
            };
        },
        "getInstalledVersionPackageJson": async () => {
            throw new Error("expected to throw");
        },
        userProvidedReplacerPath
    });
    typeSafety_1.assert(await denoifyImportExportStatement({
        "fileDirPath": "irrelevant here...",
        "importExportStatement": "import * as foo from 'foo/bar/baz'"
    }), "import * as foo from 'https://example.fr/foo/bar/baz'");
    console.log("PASS");
})();
//# sourceMappingURL=denoifyImportExportStatement.js.map