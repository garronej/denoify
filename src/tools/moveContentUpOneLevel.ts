
import * as path from "path";
import { execFactory } from "./exec";
import * as fs from "fs";

export function moveContentUpOneLevelFactory(
    params: {
        isDryRun: boolean;
    }
) {

    const { isDryRun } = params;

    const { exec } = execFactory({ isDryRun });

    async function moveContentUpOneLevel(params: {
        dirPath: string;
    }) {


        const dirPath = params.dirPath.replace(/\/$/, "");

        await exec(`mv ${dirPath}/* ${dirPath}/.[^.]* ${path.join(dirPath, "..")} || true`);

        for (const file_name of fs.readdirSync(dirPath)) {

            const file_path = path.join(dirPath, file_name);

            await exec([
                "mv",
                ...(fs.lstatSync(file_path).isDirectory() ? ["-r"] : []),
                file_path,
                "."
            ].join(" "));

        }


        await exec(`rm -r ${dirPath}`);

    }

    return { moveContentUpOneLevel };

}

