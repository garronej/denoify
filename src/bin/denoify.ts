#!/usr/bin/env node

import * as commanderStatic from "commander";
import * as fs from "fs";
import * as path from "path";
import { run } from "../lib/index";

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
            "url": "https://deno.land/x/my_module" // Or https://raw.githubusercontent.com/[user/org]/my-module/[commit hash]/ 

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

    If a devDependency is not met in deno the import will be replaced by a warning but the script will not throw.
    `)
    .option("-p, --project [projectPath]", `Default: './' -- Denoify the project given to a folder with a 'package.json' and 'tsconfig.json'.`)
    .option("--src [srcDirPath]", `Default: '[projectPath]/src' | '[projectPath]/lib' -- Path to the directory containing the source .ts files.`)
    .option("--dest [destDirPath]", `Default: Value of tsconfig.json->compilerOptions->outDir -- Directory where to put the modified .ts files.`)
    ;

commanderStatic.parse(process.argv);

const projectPath = path.resolve(commanderStatic["projectPath"] ?? ".");

run({
    "srcDirPath": ((arg: string | undefined) =>
        !!arg ?
            path.resolve(arg) :
            path.join(
                projectPath,
                ["src", "lib"]
                    .find(name => fs.existsSync(path.join(projectPath, name)))!
            )
    )(commanderStatic["srcDirPath"]),
    "destDirPath": ((arg: string | undefined) =>
        !!arg ?
            path.resolve(arg) :
            path.join(
                projectPath,
                require(path.join(projectPath, "tsconfig.json"))
                    .compilerOptions
                    .outDir
            )
    )(commanderStatic["destDirPath"]),
    projectPath,
    ...(() => {

        const packageJsonParsed = require(path.join(projectPath, "package.json"));

        return {
            "denoDependencies": packageJsonParsed?.deno?.dependencies ?? {},
            "devDependencies": Object.keys(packageJsonParsed?.devDependencies ?? {})
        };

    })()
});
