import * as child_process from "child_process";
import { createWaitForThrottle } from "../tools/waitForThrottle";
import chokidar from "chokidar";
import * as runExclusive from "run-exclusive";
import { Deferred } from "evt/tools/Deferred";
import chalk from "chalk";

export function startRebuildOnChange() {
    const { waitForThrottle } = createWaitForThrottle({ delay: 400 });

    const runYarnBuild = runExclusive.build(async () => {
        console.log(chalk.green("Running `npm run build`"));

        const dCompleted = new Deferred<void>();

        const child = child_process.spawn("npm", ["run", "build"], { shell: true });

        child.stdout.on("data", data => process.stdout.write(data));

        child.stderr.on("data", data => process.stderr.write(data));

        child.on("exit", () => dCompleted.resolve());

        await dCompleted.pr;

        console.log("\n\n");
    });

    console.log(chalk.green("Watching for changes in src/"));

    chokidar.watch(["src", "res"], { ignoreInitial: true }).on("all", async (event, path) => {
        console.log(chalk.bold(`${event}: ${path}`));

        await waitForThrottle();

        runYarnBuild();
    });
}
