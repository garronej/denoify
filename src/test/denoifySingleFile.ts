
import { denoifySingleFileFactory } from "../lib/denoifySingleFile";
import { assert } from "evt/tools/typeSafety";
import { ParsedImportExportStatement } from "../lib/types/ParsedImportExportStatement";

(async()=>{

{

const sourceCode = `
import 

    * as _ 

from 

"xxx"; import * as foobar from "xxx" import * as d from "xxx";
const ok = 3;
import { } from "xxx";
import * as baz from "xxx";
import * as foo from 'xxx';
import type * as foo from 'xxx';
import type  { Cat } from 'xxx';
import "xxx";

const dd = import("xxx");
const dd = import   (   "xxx"    );

`;

const expected = `
import * as _ from "xxx"; import * as foobar from "xxx" import * as d from "xxx";
const ok = 3;
import { } from "xxx";
import * as baz from "xxx";
import * as foo from 'xxx';
import type * as foo from 'xxx';
import type { Cat } from 'xxx';
import "xxx";

const dd = import("xxx");
const dd = import("xxx");

`.replace(/xxx/g, "yyy");

const str = "foo bar";

        const { denoifySingleFile } = denoifySingleFileFactory({
            "denoifyImportExportStatement": ({ importExportStatement, fileDirPath }) => {

                assert(fileDirPath === str);

                const parsedImportExportStatement = ParsedImportExportStatement.parse(importExportStatement)

                assert(parsedImportExportStatement.argument === "xxx");

                return Promise.resolve(
                    ParsedImportExportStatement.stringify({
                        ...parsedImportExportStatement,
                        "argument": "yyy"
                    })
                );

            }
        });


        await (async () => {

            const modifiedSourceCode = await denoifySingleFile({
                sourceCode,
                "fileDirPath": str
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
const __dirname = (()=>{
    const {url: urlStr}= import.meta;
    const url= new URL(urlStr);
    const __filename = url.protocol === "file:" ? url.pathname : urlStr;
    return __filename.replace(/[/][^/]*$/, '');
})();

const __filename = (()=>{
    const {url: urlStr}= import.meta;
    const url= new URL(urlStr);
    return url.protocol === "file:" ? url.pathname : urlStr;
})();


console.log(__dirname,__filename);
`.replace(/^\n/, "");

        const { denoifySingleFile } = denoifySingleFileFactory({
            "denoifyImportExportStatement": () => { throw new Error("never"); }
        });

        await (async () => {

            const modifiedSourceCode = await denoifySingleFile({
                sourceCode,
                "fileDirPath": "whatever"
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

                const parsedImportExportStatement = ParsedImportExportStatement.parse(importExportStatement)

                assert(parsedImportExportStatement.argument === "buffer");

                return Promise.resolve(
                    ParsedImportExportStatement.stringify({
                        ...parsedImportExportStatement,
                        "argument": "https://deno.land/std/xxx/buffer.ts"
                    })
                );


            }
        });

        await (async () => {

            const modifiedSourceCode = await denoifySingleFile({
                sourceCode,
                "fileDirPath": "whatever"
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

                const parsedImportExportStatement = ParsedImportExportStatement.parse(importExportStatement)

                assert(parsedImportExportStatement.argument === "buffer");

                return Promise.resolve(
                    ParsedImportExportStatement.stringify({
                        ...parsedImportExportStatement,
                        "argument": "https://deno.land/std/xxx/buffer.ts"
                    })
                );


            }
        });

        await (async () => {

            const modifiedSourceCode = await denoifySingleFile({
                sourceCode,
                "fileDirPath": "whatever"
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

                const parsedImportExportStatement = ParsedImportExportStatement.parse(importExportStatement)

                assert(parsedImportExportStatement.argument === "buffer");

                return Promise.resolve(
                    ParsedImportExportStatement.stringify({
                        ...parsedImportExportStatement,
                        "argument": "https://deno.land/std/xxx/buffer.ts"
                    })
                );


            }
        });

        await (async () => {

            const modifiedSourceCode = await denoifySingleFile({
                sourceCode,
                "fileDirPath": "whatever"
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
            "denoifyImportExportStatement": () => { assert(false) }
        });

        await (async () => {

            const modifiedSourceCode = await denoifySingleFile({
                sourceCode,
                "fileDirPath": "whatever"
            });

            assert(modifiedSourceCode === sourceCode);

            console.log("PASS");

        })();

    }

})();
