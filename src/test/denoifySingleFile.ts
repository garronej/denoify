import { denoifySingleFileFactory } from "../lib/denoifySingleFile";
import { assert } from "tsafe";
import { ParsedImportExportStatement } from "../lib/types/ParsedImportExportStatement";

(async () => {
    {
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

        await (async () => {
            const modifiedSourceCode = await denoifySingleFile({
                sourceCode,
                "dirPath": str
            });

            assert(modifiedSourceCode === expected);

            console.log("PASS");
        })();
    }

    {
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

        await (async () => {
            const modifiedSourceCode = await denoifySingleFile({
                sourceCode,
                "dirPath": "whatever"
            });

            assert(modifiedSourceCode === expected);

            console.log("PASS");
        })();
    }

    {
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

        await (async () => {
            const modifiedSourceCode = await denoifySingleFile({
                sourceCode,
                "dirPath": "whatever"
            });

            assert(modifiedSourceCode === expected);

            console.log("PASS");
        })();
    }

    {
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

        await (async () => {
            const modifiedSourceCode = await denoifySingleFile({
                sourceCode,
                "dirPath": "whatever"
            });

            assert(modifiedSourceCode === expected);

            console.log("PASS");
        })();
    }

    {
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

        await (async () => {
            const modifiedSourceCode = await denoifySingleFile({
                sourceCode,
                "dirPath": "whatever"
            });

            assert(modifiedSourceCode === expected);

            console.log("PASS");
        })();
    }

    {
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

        await (async () => {
            const modifiedSourceCode = await denoifySingleFile({
                sourceCode,
                "dirPath": "whatever"
            });

            assert(modifiedSourceCode === sourceCode);

            console.log("PASS");
        })();
    }
})();
