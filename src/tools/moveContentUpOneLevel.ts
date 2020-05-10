
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

        {

            const upDirPath = path.join(dirPath, "..");

            await Promise.all(
                fs.readdirSync(dirPath).map(
                    fileName => exec([
                        "mv",
                        path.join(dirPath, fileName),
                        upDirPath
                    ].join(" "))
                )
            );

        }

        await exec(`rm -r ${dirPath}`);

    }

    return { moveContentUpOneLevel };

}

