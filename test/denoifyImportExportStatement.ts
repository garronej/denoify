import * as path from "path";
import { describe, it, expect, assert } from "vitest";
import { denoifyImportExportStatementFactory } from "../src/lib/denoifyImportExportStatement";

const testDenoifyImportExportStatement = () =>
    describe("denoify import export statement", () => {
        const userProvidedReplacerPath = path.join(__dirname, "..", "dist", "bin", "replacer", "index.js");

        it("should denoify import statement with different quotation", async () => {
            const canDenoifyImports = [`"`, `'`].every(async sep => {
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

                return (
                    (await denoifyImportExportStatement({
                        "dirPath": "irrelevant here...",
                        "importExportStatement": `import * as ipaddr from ${sep}ipaddr.js${sep}`
                    })) === `import ipaddr from ${sep}https://jspm.dev/ipaddr.js@1.1.0${sep}`
                );
            });

            expect(canDenoifyImports).toBe(true);
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

export default testDenoifyImportExportStatement;
