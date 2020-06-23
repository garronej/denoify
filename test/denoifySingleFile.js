"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const denoifySingleFile_1 = require("../lib/denoifySingleFile");
const typeSafety_1 = require("evt/tools/typeSafety");
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
    const str = "foo bar";
    const { denoifySingleFile } = denoifySingleFile_1.denoifySingleFileFactory({
        "denoifyImportArgument": ({ importArgument, fileDirPath }) => {
            typeSafety_1.assert(fileDirPath === str);
            typeSafety_1.assert(importArgument === "xxx");
            return Promise.resolve("yyy");
        }
    });
    (async () => {
        const modifiedSourceCode = await denoifySingleFile({
            sourceCode,
            "fileDirPath": str
        });
        typeSafety_1.assert(modifiedSourceCode === sourceCode.replace(/xxx/g, "yyy"));
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
    const { denoifySingleFile } = denoifySingleFile_1.denoifySingleFileFactory({
        "denoifyImportArgument": () => { throw new Error("never"); }
    });
    (async () => {
        const modifiedSourceCode = await denoifySingleFile({
            sourceCode,
            "fileDirPath": "whatever"
        });
        typeSafety_1.assert(modifiedSourceCode === expected);
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
    const { denoifySingleFile } = denoifySingleFile_1.denoifySingleFileFactory({
        "denoifyImportArgument": ({ importArgument }) => {
            typeSafety_1.assert(importArgument === "buffer");
            return Promise.resolve("https://deno.land/std/xxx/buffer.ts");
        }
    });
    (async () => {
        const modifiedSourceCode = await denoifySingleFile({
            sourceCode,
            "fileDirPath": "whatever"
        });
        typeSafety_1.assert(modifiedSourceCode === expected);
        console.log("PASS");
    })();
}
//# sourceMappingURL=denoifySingleFile.js.map