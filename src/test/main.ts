
import { denoifySourceCodeStringFactory } from "../lib/denoifySourceCodeString";

import { load } from 'js-yaml'
console.log(load('hello: world')) // => prints { hello: "world" }

{

    const sourceCode = `
import 

    * as _ 

from 

"my-module-1"; import * as foobar from "my-module-2" import * as d from "my-module-3";
const ok = 3;
import { } from "my-module-4";
import * as baz from "my-module-5";
import * as foo from 'my-module-5';
import type * as foo from 'my-module-5';
import type  { Cat } from 'my-module-5';
import "oo";

const dd = import("yes-1");
const dd = import   (   "yes-1"    );

`;

    denoifySourceCodeStringFactory({
        "resolve": async ({ nodeModuleName }) => {
            return {
                "type": "PORT",
                "url": `https://deno.land/x/${nodeModuleName.replace(/-/g, "_")}/mod.ts`,
            }
        }
    }).denoifySourceCodeString({
        sourceCode,
        "fileDirPath": "."
    }).then(console.log)

}
