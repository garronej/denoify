
import { denoifyImportExportStatementFactory } from "../lib/denoifyImportExportStatement";
import * as path from "path";
import { assert } from "tsafe/assert";

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
            userProvidedReplacerPath,
            "getDestDirPath": () => "whatever"
        });

        assert(
            await denoifyImportExportStatement({
                "dirPath": "irrelevant here...",
                "importExportStatement": `import * as ipaddr from ${sep}ipaddr.js${sep}`
            }),
            `import ipaddr from ${sep}https://jspm.dev/ipaddr.js@1.1.0${sep}`
        );



    }

    {

        const { denoifyImportExportStatement } = denoifyImportExportStatementFactory({
            "resolveNodeModuleToDenoModule": () => { throw new Error("never"); },
            "getInstalledVersionPackageJson": async () => { throw new Error("never"); },
            userProvidedReplacerPath,
            "getDestDirPath": () => "whatever"
        });

        const importExportStatement = 'import ipaddr from "https://jspm.dev/ipaddr.js"';

        assert(
            await denoifyImportExportStatement({
                "dirPath": "irrelevant here...",
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
        userProvidedReplacerPath,
        "getDestDirPath": ()=> "whatever"
    });

    assert(
        await denoifyImportExportStatement({
            "dirPath": "irrelevant here...",
            "importExportStatement": "import * as foo from 'foo/bar/baz'"
        }),
        "import * as foo from 'https://example.fr/foo/bar/baz'"
    );

    console.log("PASS");

})();
