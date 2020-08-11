
import { denoifyImportExportStatementFactory } from "../lib/denoifyImportExportStatement";
import * as path from "path";
import { assert } from "evt/tools/typeSafety";

const userProvidedReplacerPath = path.join(__dirname, "..", "bin", "replacer", "index.js");

(async () => {

    for (const sep of [`"`, `'`]) {

        const { denoifyImportExportStatement } = denoifyImportExportStatementFactory({
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

        assert(
            await denoifyImportExportStatement({
                "fileDirPath": "irrelevant here...",
                "importExportStatement": `import * as ipaddr from ${sep}ipaddr.js${sep}`
            }),
            [
                `// @deno-types=${sep}https://raw.githubusercontent.com/whitequark/ipaddr.js/v1.6.0/lib/ipaddr.js.d.ts${sep}`,
                `import ipaddr from ${sep}https://jspm.dev/ipaddr.js@1.1.0${sep}`
            ].join("\n")
        );



    }

    {

        const { denoifyImportExportStatement } = denoifyImportExportStatementFactory({
            "resolveNodeModuleToDenoModule": () => { throw new Error("never"); },
            "getInstalledVersionPackageJson": async () => { throw new Error("never"); },
            userProvidedReplacerPath
        });

        const importExportStatement = 'import ipaddr from "https://jspm.dev/ipaddr.js"';

        assert(
            await denoifyImportExportStatement({
                "fileDirPath": "irrelevant here...",
                importExportStatement
            }),
            importExportStatement
        );

    }

    const { denoifyImportExportStatement } = denoifyImportExportStatementFactory({
        "resolveNodeModuleToDenoModule": async ({ nodeModuleName }) => {

            assert(nodeModuleName === "foo");

            return {
                "result": "SUCCESS",
                "getValidImportUrl": async params => {
                    assert(params.target === "SPECIFIC FILE");
                    return `https://example.fr/foo/${params.specificImportPath}`;
                }
            }


        },
        "getInstalledVersionPackageJson": async () => {
            throw new Error("expected to throw");
        },

        userProvidedReplacerPath
    });

    assert(
        await denoifyImportExportStatement({
            "fileDirPath": "irrelevant here...",
            "importExportStatement": "import * as foo from 'foo/bar/baz'"
        }),
        "import * as foo from 'https://example.fr/foo/bar/baz'"
    );

    console.log("PASS");

})();
