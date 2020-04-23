#!/usr/bin/env node
"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var commanderStatic = require("commander");
var path = require("path");
var denoify_1 = require("../lib/denoify");
commanderStatic
    .description("\n    For NPM module authors that would like to support Deno but do not want to write and maintain a port.\n    See https://github.com/garronej/denoify for instructions.\n    ")
    .option("-p, --project [projectPath]", "Default: './' -- Denoify the project given to a folder with a 'package.json' and 'tsconfig.json'.")
    .option("--src [srcDirPath]", "Default: '[projectPath]/src' | '[projectPath]/lib' -- Path to the directory containing the source .ts files.");
commanderStatic.parse(process.argv);
denoify_1.denoify({
    "projectPath": path.resolve((_a = commanderStatic["projectPath"]) !== null && _a !== void 0 ? _a : "."),
    "srcDirPath": commanderStatic["srcDirPath"],
});
