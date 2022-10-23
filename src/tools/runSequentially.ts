import { get_caller_file_path } from "scripting-tools";
import * as child_process from "child_process";
import * as path from "path";
import { Deferred } from "evt/tools/Deferred";

export async function runSequentially(params: { scriptsPaths: string[] }) {
    const { scriptsPaths } = params;

    const caller_file_path = get_caller_file_path();

    const forkId = `FORK_${caller_file_path}`;

    if (!!process.env[forkId]) {
        process.once("unhandledRejection", error => {
            throw error;
        });

        require(process.env[forkId]!.replace(/.js$/i, ""));

        return;
    }

    for (const scriptPath of scriptsPaths) {
        console.log(`Running: ${scriptPath}`);

        const dExitCode = new Deferred<number>();

        child_process
            .fork(caller_file_path, undefined, {
                "env": {
                    [forkId]: path.join(path.dirname(caller_file_path), scriptPath),
                    "GITHUB_TOKEN": process.env["GITHUB_TOKEN"]
                }
            })
            .on("message", console.log)
            .once("exit", code => dExitCode.resolve(code ?? 1));

        const exitCode = await dExitCode.pr;

        if (exitCode !== 0) {
            console.log(`${scriptPath} exited with error code: ${exitCode}`);
            process.exit(exitCode);
        }

        console.log("\n");
    }
}
