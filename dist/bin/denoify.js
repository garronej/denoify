#!/usr/bin/env node
"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const commanderStatic = require("commander");
const path = require("path");
const index_1 = require("../lib/index");
commanderStatic
    .description(`
    A tool to make node module written in TypeScript cross compatible with Deno.

    To be made cross compatible a module must:
    - Have no dependencies or each of it's dependency must be cross compatible or have a deno port available.
    - Never use the require() function.

    Every cross compatible node package should include in their package.json a custom field 
    named "deno" that will enable other packages that depend on them to be in their turn made cross 
    compatible with this tool.

    The deno field should be formatted as such:

    package.json:
    {
        "name": "my-module",
        "main": "./dist/lib/index.js",
        ...
        "dependency": {
            "events": "^3.1.0"
            "run-exclusive": "github:garronej/test-denoify-run-exclusive"
        }
        ...
        "deno": {

            "dependencies": {
                //my-module imports EventEmitter from "events".
                //obviously we can't use denoify to make "Gozala/events"
                //cross compatible ( unless you happen to be u/Gozala ).
                //However a port is available fro deno, we can use it:
                "events": {
                    "url": "https://deno.land/x/event_emitter/",
                    "main": "/mod.ts"
                }

                //NOTE: "my-module" uses run-exclusive as dependency but we don't
                // need to include it in this section as run-exclusive is a module
                // that have been made cross compatible with denoify.
                
            }

            //Url to specify so other package using "my-module" can be made cross compatible with denoify.
            "url": "https://deno.land/x/my_module" //Or https://raw.githubusercontent.com/[user/org]/my-module/[commit hash or 'master']/ 

        },
        ...
        "script" {
            "tsc": "npx tsc",
            "denoify": "npx denoify",
            "build": "npm run tsc && npm run denoify"
        },
        ...
        "devDependencies": {
            "denoify": "github:garronej/denoify"
        }
    }

    tsconfig.json:
    {
        ...
        "compilerOptions": {
            ...
            "outDir": "./dist",
            ...
        },
        ...
    }

    With "deno" field configured as such running '$ npm run denoify' will result in 
    every .ts files of the "src" folder to be transformed and put in the corresponding 
    sub path of the 'deno_dist' folder.
    
    Examples of transformations that will take place: 

    import { MyClass } from "./MyClass"                       => import { MyClass } from "./MyClass.ts"
    import { EventEmitter } from "events"                     => import { EventEmitter } from "https://deno.land/x/event_emitter/mod.ts"

    To understand the next import replacement checkout: https://github.com/garronej/evt

    import { Evt } from "evt"                                 => import { Evt } from "https://deno.land/x/evt/deno_dist/lib/index.ts"
    import { assert } from "evt/dist/tools/typeSafety"        => import { assert } from "https://deno.land/x/evt/deno_dist/tools/typeSafety/index.ts"
    import { assert } from "evt/dist/tools/typeSafety/assert" => import { assert } from "https://deno.land/x/evt/deno_dist/tools/typeSafety/assert.ts"

    If a devDependency is not met in deno the import will be replaced by a warning but the script will not throw.
    `)
    .option("-p, --project [projectPath]", `Default: './' -- Denoify the project given to a folder with a 'package.json' and 'tsconfig.json'.`)
    .option("--src [srcDirPath]", `Default: '[projectPath]/src' | '[projectPath]/lib' -- Path to the directory containing the source .ts files.`);
commanderStatic.parse(process.argv);
index_1.run({
    "projectPath": path.resolve((_a = commanderStatic["projectPath"]) !== null && _a !== void 0 ? _a : "."),
    "srcDirPath": commanderStatic["srcDirPath"],
});
