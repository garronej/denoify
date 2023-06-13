import { describe, it, expect, assert } from "vitest";
import { denoifySingleFileFactory } from "../src/lib/denoifySingleFile";
import { ParsedImportExportStatement } from "../src/lib/types/ParsedImportExportStatement";
import { assert as tsafeAssert } from "tsafe/assert";

describe("denoify single file", () => {
    it("should denoify source code of a file", async () => {
        const sourceCode = `
import 

    * as _ 

from 

"xxx"; import * as foobar from "xxx"
    import * as d from "xxx";
const ok = 3;
import { } from "xxx";
import * as baz from "xxx";
import * as foo from 'xxx';
import type * as foo from 'xxx';
import type  { Cat } from 'xxx';
/**
 * import "zzz";
 */
import "xxx";

const dd = import("xxx");
const dd = import   (   "xxx"    );
declare module 'xxx' {
    interface URItoKind<A> {
      readonly [URI]: Array<A>
    }
}
import Parser, { ParserOptions, Abc } from 'xxx';
`;

        const expected = `
import * as _ from "xxx"; import * as foobar from "xxx"
    import * as d from "xxx";
const ok = 3;
import { } from "xxx";
import * as baz from "xxx";
import * as foo from 'xxx';
import type * as foo from 'xxx';
import type { Cat } from 'xxx';
/**
 * import "zzz";
 */
import "xxx";

const dd = import("xxx");
const dd = import("xxx");
declare module 'yyy' {
    interface URItoKind<A> {
      readonly [URI]: Array<A>
    }
}
import Parser, { ParserOptions, Abc } from 'xxx';
`.replace(/xxx/g, "yyy");

        const str = "foo bar";

        const { denoifySingleFile } = denoifySingleFileFactory({
            "denoifyImportExportStatement": ({ importExportStatement, dirPath }) => {
                assert(dirPath === str);

                const parsedImportExportStatement = ParsedImportExportStatement.parse(importExportStatement);

                assert(
                    parsedImportExportStatement.parsedArgument.type === "DEPENDENCY" &&
                        parsedImportExportStatement.parsedArgument.nodeModuleName === "xxx"
                );

                return Promise.resolve(
                    ParsedImportExportStatement.stringify({
                        ...parsedImportExportStatement,
                        "parsedArgument": {
                            "type": "URL",
                            "url": "yyy"
                        }
                    })
                );
            }
        });

        const modifiedSourceCode = await denoifySingleFile({
            sourceCode,
            "dirPath": str
        });

        expect(modifiedSourceCode).toBe(expected);
    });

    it("should denoify source code of a file", async () => {
        const sourceCode = `
console.log(__dirname,__filename);
`;

        const expected = `
const __dirname = (() => {
    const { url: urlStr } = import.meta;
    const url = new URL(urlStr);
    const __filename = (url.protocol === "file:" ? url.pathname : urlStr)
        .replace(/[/][^/]*$/, '');

    const isWindows = (() => {

        let NATIVE_OS: typeof Deno.build.os = "linux";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const navigator = (globalThis as any).navigator;
        if (globalThis.Deno != null) {
            NATIVE_OS = Deno.build.os;
        } else if (navigator?.appVersion?.includes?.("Win") ?? false) {
            NATIVE_OS = "windows";
        }

        return NATIVE_OS == "windows";

    })();

    return isWindows ?
        __filename.split("/").join("\\\\").substring(1) :
        __filename;
})();

const __filename = (() => {
    const { url: urlStr } = import.meta;
    const url = new URL(urlStr);
    const __filename = (url.protocol === "file:" ? url.pathname : urlStr);

    const isWindows = (() => {

        let NATIVE_OS: typeof Deno.build.os = "linux";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const navigator = (globalThis as any).navigator;
        if (globalThis.Deno != null) {
            NATIVE_OS = Deno.build.os;
        } else if (navigator?.appVersion?.includes?.("Win") ?? false) {
            NATIVE_OS = "windows";
        }

        return NATIVE_OS == "windows";

    })();

    return isWindows ?
        __filename.split("/").join("\\\\").substring(1) :
        __filename;
})();


console.log(__dirname,__filename);
`.replace(/^\n/, "");

        const { denoifySingleFile } = denoifySingleFileFactory({
            "denoifyImportExportStatement": () => {
                throw new Error("never");
            }
        });

        const modifiedSourceCode = await denoifySingleFile({
            sourceCode,
            "dirPath": "whatever"
        });

        expect(modifiedSourceCode).toBe(expected);
    });

    it("should denoify source code by chaining the import statement", async () => {
        const sourceCode = `
import { Buffer } from "buffer";

Buffer.from("hello");
`;

        const expected = `
import { Buffer } from "https://deno.land/std/xxx/buffer.ts";

Buffer.from("hello");
`;

        const { denoifySingleFile } = denoifySingleFileFactory({
            "denoifyImportExportStatement": ({ importExportStatement }) => {
                const parsedImportExportStatement = ParsedImportExportStatement.parse(importExportStatement);

                assert(
                    parsedImportExportStatement.parsedArgument.type === "DEPENDENCY" &&
                        parsedImportExportStatement.parsedArgument.nodeModuleName === "buffer"
                );

                return Promise.resolve(
                    ParsedImportExportStatement.stringify({
                        ...parsedImportExportStatement,
                        "parsedArgument": {
                            "type": "URL",
                            "url": "https://deno.land/std/xxx/buffer.ts"
                        }
                    })
                );
            }
        });

        const modifiedSourceCode = await denoifySingleFile({
            sourceCode,
            "dirPath": "whatever"
        });

        expect(modifiedSourceCode).toBe(expected);
    });

    it("should denoify the source code by adding relevant import statement", async () => {
        const sourceCode = `
Buffer.from("hello");
`;

        const expected = `
import { Buffer } from "https://deno.land/std/xxx/buffer.ts";

Buffer.from("hello");
`.replace(/^\n/, "");

        const { denoifySingleFile } = denoifySingleFileFactory({
            "denoifyImportExportStatement": ({ importExportStatement }) => {
                const parsedImportExportStatement = ParsedImportExportStatement.parse(importExportStatement);

                assert(
                    parsedImportExportStatement.parsedArgument.type === "DEPENDENCY" &&
                        parsedImportExportStatement.parsedArgument.nodeModuleName === "buffer"
                );

                return Promise.resolve(
                    ParsedImportExportStatement.stringify({
                        ...parsedImportExportStatement,
                        "parsedArgument": {
                            "type": "URL",
                            "url": "https://deno.land/std/xxx/buffer.ts"
                        }
                    })
                );
            }
        });

        const modifiedSourceCode = await denoifySingleFile({
            sourceCode,
            "dirPath": "whatever"
        });

        expect(modifiedSourceCode).toBe(expected);
    });
    it("should denoify the source code by adding relevant import statement", async () => {
        const sourceCode = `
Buffer`;

        const expected = `
import { Buffer } from "https://deno.land/std/xxx/buffer.ts";

Buffer`.replace(/^\n/, "");

        const { denoifySingleFile } = denoifySingleFileFactory({
            "denoifyImportExportStatement": ({ importExportStatement }) => {
                const parsedImportExportStatement = ParsedImportExportStatement.parse(importExportStatement);

                assert(
                    parsedImportExportStatement.parsedArgument.type === "DEPENDENCY" &&
                        parsedImportExportStatement.parsedArgument.nodeModuleName === "buffer"
                );

                return Promise.resolve(
                    ParsedImportExportStatement.stringify({
                        ...parsedImportExportStatement,
                        "parsedArgument": {
                            "type": "URL",
                            "url": "https://deno.land/std/xxx/buffer.ts"
                        }
                    })
                );
            }
        });

        const modifiedSourceCode = await denoifySingleFile({
            sourceCode,
            "dirPath": "whatever"
        });

        expect(modifiedSourceCode).toBe(expected);
    });

    it("should not change the source code when there is no external dependencies needed", async () => {
        const sourceCode = `
ArrayBuffer.from("hello");
new BufferSource.foo()
Buffer_name
`;

        const { denoifySingleFile } = denoifySingleFileFactory({
            "denoifyImportExportStatement": () => {
                assert(false);
            }
        });

        const modifiedSourceCode = await denoifySingleFile({
            sourceCode,
            "dirPath": "whatever"
        });

        expect(modifiedSourceCode).toBe(sourceCode);
    });
    it("should remove the lines next to special comment // @denoify-line-ignore", async () => {
        const sourceCode = `// @denoify-line-ignore: no need for polyfills\nimport 'minimal-polyfills';\nconsole.log('hello world');\n// @denoify-line-ignore\nimport 'minimal-polyfills/Object.fromEntries';\nconsole.log('// @denoify-line-ignore');`;

        const expected = `console.log('hello world');\nconsole.log('// @denoify-line-ignore');`;

        const { denoifySingleFile } = denoifySingleFileFactory({
            "denoifyImportExportStatement": () => {
                tsafeAssert(false);
            }
        });

        const modifiedSourceCode = await denoifySingleFile({
            sourceCode,
            "dirPath": ""
        });

        expect(modifiedSourceCode).toBe(expected);
    });
    it("should access environment variables correctly", async () => {
        const sourceCode = `const foo = process.env.FOO\nconst bar = process.env['BAR'];`;

        const expected = `const foo = Deno.env.get('FOO')\nconst bar = Deno.env.get('BAR');`;

        const { denoifySingleFile } = denoifySingleFileFactory({
            "denoifyImportExportStatement": () => {
                tsafeAssert(false);
            }
        });

        const modifiedSourceCode = await denoifySingleFile({
            sourceCode,
            "dirPath": ""
        });

        expect(modifiedSourceCode).toBe(expected);
    });
    it("should set environment variables correctly", async () => {
        const sourceCode = `process.env.FOO = 'foo';\nprocess.env['BAR'] = 22;`;

        const expected = `Deno.env.set('FOO', 'foo');\nDeno.env.set('BAR', 22);`;

        const { denoifySingleFile } = denoifySingleFileFactory({
            "denoifyImportExportStatement": () => {
                tsafeAssert(false);
            }
        });

        const modifiedSourceCode = await denoifySingleFile({
            sourceCode,
            "dirPath": ""
        });

        expect(modifiedSourceCode).toBe(expected);
    });
    it("should update environment variables correctly", async () => {
        const sourceCode = `process.env.FOO = process.env['BAR']+1;\nprocess.env['BAR'] = process.env.FOO + 'bar';`;

        const expected = `Deno.env.set('FOO', Deno.env.get('BAR')+1);\nDeno.env.set('BAR', Deno.env.get('FOO') + 'bar');`;

        const { denoifySingleFile } = denoifySingleFileFactory({
            "denoifyImportExportStatement": () => {
                tsafeAssert(false);
            }
        });

        const modifiedSourceCode = await denoifySingleFile({
            sourceCode,
            "dirPath": ""
        });

        expect(modifiedSourceCode).toBe(expected);
    });
});
