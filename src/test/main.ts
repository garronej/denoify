
import { replaceImportsFactory } from "../lib/replaceImportsFactory";

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

import { ObserverImpl } from "ts-evt/dist/lib/Observable";

require("./ok");
`;

    replaceImportsFactory({
        "getDenoModuleRepo": async nodeModuleName => {
            return {
                "url": `https://deno.land/x/${nodeModuleName}`,
                "main": "/mod.ts"
            }
        }
    }).replaceImports({
        sourceCode
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




