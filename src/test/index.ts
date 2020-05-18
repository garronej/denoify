
import * as child_process from "child_process";
import * as path from "path";
import { Deferred } from "evt/dist/tools/Deferred";

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

        const dExitCode = new Deferred<number>();

        child_process.fork(
            __filename,
            undefined,
            { "env": { "FORK": path.join(__dirname, name) } }
        )
            .on("message", console.log)
            .once("exit", code => dExitCode.resolve(code ?? 1))
            ;

        const exitCode = await dExitCode.pr;

        if (exitCode !== 0) {
            console.log(`${name} exited with error code: ${exitCode}`);
            process.exit(exitCode);
        }

        console.log("\n");

    }

})();
