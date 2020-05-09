
import * as path from "path";
import { execFactory } from "./exec";

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
        await exec(`rm -r ${dirPath}`);

    }

    return { moveContentUpOneLevel };

}

