#!/usr/bin/env node

import * as commanderStatic from "commander";
import * as path from "path";
import { run } from "../lib/index";

commanderStatic
    .description(`
    A build to support Deno and release on NPM with a single codebase.
    See https://github.com/garronej/denoify for instructions
    `)
    .option("-p, --project [projectPath]", `Default: './' -- Denoify the project given to a folder with a 'package.json' and 'tsconfig.json'.`)
    .option("--src [srcDirPath]", `Default: '[projectPath]/src' | '[projectPath]/lib' -- Path to the directory containing the source .ts files.`)
    ;

commanderStatic.parse(process.argv);

run({
    "projectPath": path.resolve(commanderStatic["projectPath"] ?? "."),
    "srcDirPath": commanderStatic["srcDirPath"],
});
