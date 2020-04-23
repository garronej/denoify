
import * as child_process from "child_process";
import * as path from "path";
import { Deferred } from "evt/dist/tools/Deferred";

(async () => {

    for( const name of ["scheme", "resolve", "denoifyImportArgument", "denoifySingleFile"  ]){

        console.log(`Running: ${name}`);

        const dExitCode = new Deferred<number>();

        child_process.fork(
            path.join(__dirname, name + ".js")
        )
            .on("message", console.log)
            .once("exit", code => dExitCode.resolve(code))
            ;

        const exitCode = await dExitCode.pr;

        if( exitCode !== 0 ){
            console.log(`${name} exited with error code: ${exitCode}`);
            process.exit(exitCode);
        }

        console.log("\n");

    }



})();
