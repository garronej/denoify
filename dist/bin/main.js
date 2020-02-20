"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commanderStatic = require("commander");
const fs = require("fs");
const path = require("path");
const index_1 = require("../lib/index");
const denoIndexFileName = "deno-repo-index.json";
const defaultSrcDir = "src";
const defaultDestDir = "dist_deno";
commanderStatic
    .description("Transform a Typescript codebase using CommonJS import into a deno compatible codebase.")
    .option("--src [srcDirPath]", `Default "./${defaultSrcDir}", Path to the 'src' directory containing the .ts files`)
    .option("--dest [destDirPath]", `default: "./${defaultDestDir}", Path where to put the directory containing the transformed source files that will run on Deno`)
    .option("--deno-repo-index-path [repoIndexPath]", `Path to the ${denoIndexFileName} file, Default ./${denoIndexFileName}, can be unspecified if transpiled codebase have no dependencies or if every dependency specify a deno version of the module in package.json using "deno" field. The ${denoIndexFileName} is used to tel where to find the deno module counterpart of the node module dependency of the project.`)
    .option("--node_modules-dir-path [nodeModulePath]", `Default ./node_modules, used to read the 'package.json of the dependency in search for the "deno" field that specify where to find the deno module counterpart.`);
commanderStatic.parse(process.argv);
const repoIndex = ((arg_repoIndexPath) => {
    const repoIndexPath = arg_repoIndexPath !== undefined ?
        path.resolve(arg_repoIndexPath) :
        path.join(process.cwd(), denoIndexFileName);
    const doesExist = fs.existsSync(repoIndexPath);
    if (arg_repoIndexPath !== undefined && !doesExist) {
        throw new Error(`${repoIndexPath} not found`);
    }
    return doesExist ? require(repoIndexPath) : {};
})(commanderStatic["repoIndexPath"]);
const nodeModuleDirPath = ((arg_nodeModuleDirPath) => arg_nodeModuleDirPath !== undefined ?
    path.resolve(arg_nodeModuleDirPath) :
    path.join(process.cwd(), "node_modules"))(commanderStatic["nodeModulePath"]);
const srcDirPath = ((arg_srcDirPath) => arg_srcDirPath !== undefined ?
    path.resolve(arg_srcDirPath) :
    path.join(process.cwd(), defaultSrcDir))(commanderStatic["srcDirPath"]);
const destDirPath = ((arg_dstDirPath) => arg_dstDirPath !== undefined ?
    path.resolve(arg_dstDirPath) :
    path.join(process.cwd(), defaultDestDir))(commanderStatic["destDirPath"]);
index_1.run({
    srcDirPath,
    destDirPath,
    nodeModuleDirPath,
    repoIndex
});
/*
type CommanderStatic= import("commander").CommanderStatic;

function defineScript(commanderStatic: CommanderStatic): void {

    commanderStatic
        .command("



}


if (require.main === module) {

    process.once("unhandledRejection", error => { throw error; });

    import("commander").then(defineScript);

    import("commander").then(program => {

        program
            .command("install")
            .action(() => program_action_install())
            ;

        program
            .command("uninstall")
            .action(() => program_action_uninstall())
            ;

        program
            .command("release")
            .action(() => program_action_release())
            ;


        program.parse(process.argv);



        program
    .command("unlock")
    .description("provide SIM PIN or PUK to unlock dongle")
    .option("-i, --imei [imei]", "IMEI of the dongle")
    .option("-p, --pin [pin]", "SIM PIN ( 4 digits )")
    .option("--puk [puk-newPin]", "PUK ( 8 digits ) and new PIN eg. --puk 12345678-0000")
    .action(async options => {


    });




    });





}
*/ 
