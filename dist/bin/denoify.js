#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commanderStatic = require("commander");
const denoify_1 = require("../lib/denoify");
commanderStatic
    .description(`
    For NPM module authors that would like to support Deno but do not want to write and maintain a port.
    See https://github.com/garronej/denoify for instructions.
    `)
    .option("-p, --project [projectPath]", `Default: './' -- Denoify the project given to a folder with a 'package.json' and 'tsconfig.json'.`)
    .option("--src [srcDirPath]", `Default: '[projectPath]/src' | '[projectPath]/lib' -- Path to the directory containing the source .ts files. If the provided path is not absolute it is assumed relative to [projectPath]`);
commanderStatic.parse(process.argv);
denoify_1.denoify({
    "projectPath": commanderStatic["projectPath"],
    "srcDirPath": commanderStatic["srcDirPath"]
});
