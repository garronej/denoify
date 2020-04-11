#!/usr/bin/env node
"use strict";
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
const commanderStatic = require("commander");
const fs = require("fs");
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
        }
        ...
        "deno": {
            //Url that point to the root of the project repository.
            "url": "https://deno.land/x/my_module" // Or https://raw.githubusercontent.com/[user]/my-module/master/ 

            //(Optional) Relative path to the default deno export.
            //If not present it will be deduced from "main" ( here "./dist/lib/index.js" )
            "main": "./dist/lib/index.ts",
            "dependencies": {
                //Let's say that my-module imports EventEmitter from "events".
                //The "events" npm package is not a cross compatible package,
                //"Gozala/events"'s package.json does not specify a "deno" field,
                //yet a port is available for deno so we can explicitly reference it.
                "events": {
                    "url": "https://deno.land/x/event_emitter/",
                    "main": "/mod.ts"
                },
                //...
            }

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
    sub path of the 'dist' folder.
    
    Examples of transformations that will take place: 

    import { MyClass } from "./MyClass"                      => import { MyClass } from "./MyClass.ts"
    import { EventEmitter } from "events"                    => import { EventEmitter } from "https://deno.land/x/event_emitter/mod.ts"
    import { Evt } from "ts-evt"                             => import { Evt } from "https://deno.land/x/evt/dist/lib/index.ts"
    import { Observable } from "ts-evt/dist/lib/Observable"  => import { Observable } from "https://deno.land/x/evt/dist/lib/index.ts"
    `)
    .option("-p, --project [projectPath]", `Default: './' -- Denoify the project given to a folder with a 'package.json' and 'tsconfig.json'.`)
    .option("--src [srcDirPath]", `Default: '[projectPath]/src' | '[projectPath]/lib' -- Path to the directory containing the source .ts files.`)
    .option("--dest [destDirPath]", `Default: Value of tsconfig.json->compilerOptions->outDir -- Directory where to put the modified .ts files.`);
commanderStatic.parse(process.argv);
const projectPath = path.resolve((_a = commanderStatic["projectPath"]) !== null && _a !== void 0 ? _a : ".");
index_1.run({
    "srcDirPath": ((arg) => !!arg ?
        path.resolve(arg) :
        path.join(projectPath, ["src", "lib"]
            .find(name => fs.existsSync(path.join(projectPath, name)))))(commanderStatic["srcDirPath"]),
    "destDirPath": ((arg) => !!arg ?
        path.resolve(arg) :
        path.join(projectPath, require(path.join(projectPath, "tsconfig.json"))
            .compilerOptions
            .outDir))(commanderStatic["destDirPath"]),
    "nodeModuleDirPath": path.join(projectPath, "node_modules"),
    "denoDependencies": (_d = (_c = (_b = require(path.join(projectPath, "package.json"))) === null || _b === void 0 ? void 0 : _b.deno) === null || _c === void 0 ? void 0 : _c.dependencies) !== null && _d !== void 0 ? _d : {}
});
