#!/usr/bin/env node

import * as commanderStatic from "commander";
import { denoify } from "../lib/denoify";

process.once("unhandledRejection", error => {
    throw error;
});

commanderStatic
    .description(
        `
    For NPM module authors that would like to support Deno but do not want to write and maintain a port.
    See https://github.com/garronej/denoify for instructions.
    `
    )
    .option(
        "-p, --project [projectPath]",
        `Default: './' -- Root path of the project to denoify, target directory is supposed to contain a 'package.json' and 'tsconfig.json'.`
    )
    .option(
        "--src [srcDirPath]",
        `Default: '[projectPath]/src' | '[projectPath]/lib' -- Path to the directory containing the source .ts files. If the provided path is not absolute it is assumed relative to [projectPath]`
    )
    .option("-o --out [outputDirPath]", `Default: '$(dirname <tsconfig.outDir>)/deno_lib' -- Path to the output directory`)
    .option("-i --index [indexFilePath]", `Default: 'Read from package.json' -- Path to the index.ts file typically: "src/lib/index.ts"`);

commanderStatic.parse(process.argv);

const options = commanderStatic.opts();

denoify({
    "projectPath": options.project,
    "srcDirPath": options.src,
    "denoDistPath": options.out,
    "indexFilePath": options.index
});
