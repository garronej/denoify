import * as fs from "fs";
import * as path from "path";

/** To support node < v10  we don't use fs.mkdir */
export async function createDirectoryIfNotExistsRecursive(dirname: string) {
    return new Promise<void>(resolve => {
        // initialize directories with final directory
        const directories_backwards = [dirname];
        let minimize_dir = dirname;
        while ((minimize_dir = minimize_dir.substring(0, minimize_dir.lastIndexOf(path.sep)))) {
            directories_backwards.push(minimize_dir);
        }

        const directories_needed = [];

        //stop on first directory found
        for (const d in directories_backwards) {
            if (!fs.existsSync(directories_backwards[d])) {
                directories_needed.push(directories_backwards[d]);
            } else {
                break;
            }
        }

        //no directories missing
        if (!directories_needed.length) {
            return resolve();
        }

        // make all directories in ascending order
        var directories_forwards = directories_needed.reverse();

        for (const d in directories_forwards) {
            fs.mkdirSync(directories_forwards[d]);
        }

        return resolve();
    });
}
