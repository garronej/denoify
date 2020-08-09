"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSequentially = void 0;
const scripting_tools_1 = require("scripting-tools");
const child_process = require("child_process");
const path = require("path");
const Deferred_1 = require("evt/tools/Deferred");
async function runSequentially(params) {
    const { scriptsPaths } = params;
    const caller_file_path = scripting_tools_1.get_caller_file_path();
    const forkId = `FORK_${caller_file_path}`;
    if (!!process.env[forkId]) {
        process.once("unhandledRejection", error => { throw error; });
        require(process.env[forkId].replace(/.js$/i, ""));
        return;
    }
    for (const scriptPath of scriptsPaths) {
        console.log(`Running: ${scriptPath}`);
        const dExitCode = new Deferred_1.Deferred();
        child_process.fork(caller_file_path, undefined, { "env": { [forkId]: path.join(path.dirname(caller_file_path), scriptPath) } })
            .on("message", console.log)
            .once("exit", code => dExitCode.resolve(code !== null && code !== void 0 ? code : 1));
        const exitCode = await dExitCode.pr;
        if (exitCode !== 0) {
            console.log(`${scriptPath} exited with error code: ${exitCode}`);
            process.exit(exitCode);
        }
        console.log("\n");
    }
}
exports.runSequentially = runSequentially;
//# sourceMappingURL=runSequentially.js.map