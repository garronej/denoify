import * as path from "path";

export function isInsideOrIsDir(params: { dirPath: string; fileOrDirPath: string }) {
    const { dirPath, fileOrDirPath } = params;

    const relative = path.relative(dirPath, fileOrDirPath);

    if (relative === "") {
        return true;
    }

    return !relative.startsWith("..");
}
