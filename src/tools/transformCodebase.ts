import * as fs from "fs";
import * as path from "path";
import { crawl } from "./crawl";
import { createDirectoryIfNotExistsRecursive } from "./createDirectoryIfNotExistsRecursive";

/** Apply a transformation function to every file of directory */
export async function transformCodebase(params: {
    srcDirPath: string;
    destDirPath: string;
    transformSourceCodeString: (params: { sourceCode: string; filePath: string }) => Promise<
        | {
              modifiedSourceCode: string;
              newFileName?: string;
          }
        | undefined
    >;
}) {
    const { srcDirPath, destDirPath, transformSourceCodeString } = params;

    for (const file_relative_path of crawl(srcDirPath)) {
        const filePath = path.join(srcDirPath, file_relative_path);

        const transformSourceCodeStringResult = await transformSourceCodeString({
            "sourceCode": fs.readFileSync(filePath).toString("utf8"),
            "filePath": path.join(srcDirPath, file_relative_path)
        });

        if (transformSourceCodeStringResult === undefined) {
            continue;
        }

        await createDirectoryIfNotExistsRecursive(path.dirname(path.join(destDirPath, file_relative_path)));

        const { newFileName, modifiedSourceCode } = transformSourceCodeStringResult;

        fs.writeFileSync(
            path.join(path.dirname(path.join(destDirPath, file_relative_path)), newFileName ?? path.basename(file_relative_path)),
            Buffer.from(modifiedSourceCode, "utf8")
        );
    }
}
