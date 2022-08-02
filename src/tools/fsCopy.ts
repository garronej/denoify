import * as fs from "fs";
import * as path from "path";
import { crawl } from "./crawl";

/** Copy file or directory. Works on windows.
 * Non exsisting directories are created recursively
 */
export const fsCopy = (src: string, dest: string) => {
    if (!fs.lstatSync(src).isDirectory()) {
        fs.mkdirSync(path.dirname(dest), { "recursive": true });

        fs.copyFileSync(src, dest);

        return;
    }

    crawl(src).forEach(relativeFilePath => {
        fs.mkdirSync(dest, { "recursive": true });

        fs.copyFileSync(path.join(src, relativeFilePath), path.join(dest, relativeFilePath));
    });
};
