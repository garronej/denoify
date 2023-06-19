import * as fs from "fs";
import * as path from "path";

/** List all files in a given directory return paths relative to the dir_path */
export const crawl = (() => {
    // Since we're mutating this, there's no need to pass it around between the recursing function calls
    const paths: string[] = [];
    const crawlRec = (dir_path: string) => {
        for (const file_name of fs.readdirSync(dir_path)) {
            const file_path = path.join(dir_path, file_name);

            if (fs.lstatSync(file_path).isDirectory()) {
                crawlRec(file_path);

                continue;
            }

            paths.push(file_path);
        }
    };

    return function crawl(dir_path: string): string[] {
        crawlRec(dir_path);

        return paths.map(file_path => path.relative(dir_path, file_path));
    };
})();
