
import { denoifySingleFileFactory } from "../lib/denoifySingleFile";
import { assert } from "evt/dist/tools/typeSafety";


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

const { denoifySingleFile } = denoifySingleFileFactory({
    "denoifyImportArgument": ({ importArgument, fileDirPath }) => {

        assert(fileDirPath === str);
        assert(importArgument === "xxx");

        return Promise.resolve("yyy");

    }
});


(async () => {

    const modifiedSourceCode = await denoifySingleFile({
        sourceCode,
        "fileDirPath": str
    });

    assert(modifiedSourceCode === sourceCode.replace(/xxx/g, "yyy"));

    console.log("PASS");

})();


