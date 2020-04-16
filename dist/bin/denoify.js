#!/usr/bin/env node
"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var commanderStatic = require("commander");
var path = require("path");
var index_1 = require("../lib/index");
commanderStatic
    .description("\n    A build to support Deno and release on NPM with a single codebase.\n    See https://github.com/garronej/denoify for instructions\n    ")
    .option("-p, --project [projectPath]", "Default: './' -- Denoify the project given to a folder with a 'package.json' and 'tsconfig.json'.")
    .option("--src [srcDirPath]", "Default: '[projectPath]/src' | '[projectPath]/lib' -- Path to the directory containing the source .ts files.");
commanderStatic.parse(process.argv);
index_1.run({
    "projectPath": path.resolve((_a = commanderStatic["projectPath"]) !== null && _a !== void 0 ? _a : "."),
    "srcDirPath": commanderStatic["srcDirPath"],
});
