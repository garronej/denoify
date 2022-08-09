import * as path from "path";
import { execFactory } from "./exec";
import * as st from "scripting-tools";
import { crawl } from "./crawl";

export function moveContentUpOneLevelFactory(params: { isDryRun: boolean }) {
    const { isDryRun } = params;

    const { exec } = execFactory({ isDryRun });

    async function moveContentUpOneLevel(params: { dirPath: string }): Promise<{
        beforeMovedFilePaths: string[]; //Path expressed relative to dirPath
    }> {
        const dirPath = params.dirPath.replace(/\/$/, "");

        const upDirPath = path.join(dirPath, "..");

        const beforeMovedFilePaths = crawl(dirPath);

        for (const beforeMovedFilePath of beforeMovedFilePaths) {
            console.log(
                [
                    `${isDryRun ? "(dry) " : ""}Moving`,
                    path.join(dirPath, beforeMovedFilePath),
                    `to ${path.join(upDirPath, beforeMovedFilePath)}`
                ].join(" ")
            );

            walk: {
                if (isDryRun) {
                    break walk;
                }

                st.fs_move("MOVE", dirPath, upDirPath, beforeMovedFilePath);
            }
        }

        await exec(`rm -r ${dirPath}`);

        return { beforeMovedFilePaths };
    }

    return { moveContentUpOneLevel };
}
