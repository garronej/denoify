"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const path = require("path");
const Deferred_1 = require("evt/tools/Deferred");
const names = [
    "scheme",
    "resolve",
    "denoifyImportArgument",
    "denoifySingleFile"
];
(async () => {
    if (!!process.env.FORK) {
        process.once("unhandledRejection", error => { throw error; });
        require(process.env.FORK);
        return;
    }
    for (const name of names) {
        console.log(`Running: ${name}`);
        const dExitCode = new Deferred_1.Deferred();
        child_process.fork(__filename, undefined, { "env": { "FORK": path.join(__dirname, name) } })
            .on("message", console.log)
            .once("exit", code => dExitCode.resolve(code !== null && code !== void 0 ? code : 1));
        const exitCode = await dExitCode.pr;
        if (exitCode !== 0) {
            console.log(`${name} exited with error code: ${exitCode}`);
            process.exit(exitCode);
        }
        console.log("\n");
    }
})();
//# sourceMappingURL=index.js.map