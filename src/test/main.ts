
import { denoifySourceCodeStringFactory } from "../lib/denoifySourceCodeString";

{

    const sourceCode = `
import 

    * as _ 

from 

"scripting-tools1"; import * as foobar from "scripting-tools2" import * as d from "scripting-tools3";
const ok = 3;
import { } from "scripting-tools4";
import * as baz from "scripting-tools5";
import * as foo from 'scripting-tools5';
import "oo";

const dd = import("yes-1");
const dd = import   (   "yes-1"    );
require("colors");

`;

    denoifySourceCodeStringFactory({
        "resolve": async ({ nodeModuleName }) => {
            return {
                "type": "PORT",
                "denoDependency": {
                    "url": `https://deno.land/x/${nodeModuleName.replace(/-/g, "_")}`,
                    "main": "/mod.ts"
                }
            }
        }
    }).denoifySourceCodeString({
        sourceCode,
        "fileDirPath": "."
    }).then(console.log)

}

/*
import { transformCodebase } from "../lib/transformCodebase";
import * as path from "path";

const module_dir_path = path.join(__dirname, "..", "..");


{

    transformCodebase({
        "src_dir_path": path.join(module_dir_path, "res", "src"),
        "dest_dir_path": path.join(module_dir_path, "res", "deno_generated_src"),
        "transformSourceCode": ({ extension, sourceCode }) => Promise.resolve(sourceCode)
    }).then(() => console.log("DONE"));

}
*/




