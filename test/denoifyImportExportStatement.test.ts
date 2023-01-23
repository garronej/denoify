import * as path from "path";
import { describe, it, expect, assert } from "vitest";
import { denoifyImportExportStatementFactory } from "../src/lib/denoifyImportExportStatement";

describe("denoify import export statement", () => {
    const userProvidedReplacerPath = path.join(__dirname, "..", "dist", "bin", "replacer", "index.js");

    it.each([`"`, `'`])("should denoify import statement with quotation of '%s'", async sep => {
        const { denoifyImportExportStatement } = denoifyImportExportStatementFactory({
            "resolveNodeModuleToDenoModule": () => {
                throw new Error("never");
            },
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

        expect(
            await denoifyImportExportStatement({
                "dirPath": "irrelevant here...",
                "importExportStatement": `import * as ipaddr from ${sep}ipaddr.js${sep}`
            })
        ).toBe(`import ipaddr from ${sep}https://jspm.dev/ipaddr.js@1.1.0${sep}`);
    });

    it("should remain imported url as it is", async () => {
        const { denoifyImportExportStatement } = denoifyImportExportStatementFactory({
            "resolveNodeModuleToDenoModule": () => {
                throw new Error("never");
            },
            "getInstalledVersionPackageJson": async () => {
                throw new Error("never");
            },
            userProvidedReplacerPath,
            "getDestDirPath": () => "whatever"
        });

        const importExportStatement = 'import ipaddr from "https://jspm.dev/ipaddr.js"';

        expect(
            await denoifyImportExportStatement({
                "dirPath": "irrelevant here...",
                importExportStatement
            })
        ).toBe(importExportStatement);
    });

    it("should denoify import statement with specific file", async () => {
        const { denoifyImportExportStatement } = denoifyImportExportStatementFactory({
            "resolveNodeModuleToDenoModule": async ({ nodeModuleName }) => {
                assert(nodeModuleName === "foo");

                return {
                    "result": "SUCCESS",
                    "getValidImportUrl": async params => {
                        assert(params.target === "SPECIFIC FILE");
                        return `https://example.fr/foo/${params.specificImportPath}`;
                    }
                };
            },
            "getInstalledVersionPackageJson": async () => {
                throw new Error("expected to throw");
            },
            userProvidedReplacerPath,
            "getDestDirPath": () => "whatever"
        });

        expect(
            await denoifyImportExportStatement({
                "dirPath": "irrelevant here...",
                "importExportStatement": "import * as foo from 'foo/bar/baz'"
            })
        ).toBe("import * as foo from 'https://example.fr/foo/bar/baz'");
    });
});
