
import * as fs from "fs";
import * as path from "path";
import { crawl } from "../tools/crawl";

/** Apply a transformation function to every file of directory */
export async function transformCodebase(
    params: {
        srcDirPath: string;
        destDirPath: string;
        transformSourceCodeString: (params: {
            /** e.g: .ts */
            extension: string;
            sourceCode: string;
            fileDirPath: string;
        }) => Promise<string>;
    }
) {

    const { srcDirPath, destDirPath, transformSourceCodeString } = params;

    for (const file_relative_path of crawl(srcDirPath)) {

        {

            const [src, dest] = [srcDirPath, destDirPath]
                .map(base => path.join(base, file_relative_path))
                ;

            fs.copyFileSync(src, dest);

        }

        const file_path = path.join(destDirPath, file_relative_path);

        fs.writeFileSync(
            file_path,
            Buffer.from(
                await transformSourceCodeString({
                    "extension": path.extname(file_path).substr(1).toLowerCase(),
                    "sourceCode": fs.readFileSync(file_path).toString("utf8"),
                    "fileDirPath": path.dirname(path.join(srcDirPath, file_relative_path))
                }),
                "utf8"
            )
        );

    }


}

