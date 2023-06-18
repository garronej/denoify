import * as fs from "fs/promises";
import fetch from "node-fetch";

export const getLocalFileContents = async (filePath: string) => {
    try {
        await fs.access(filePath);
        return fs.readFile(filePath, { encoding: "utf8" });
    } catch {
        return undefined;
    }
};

export const getRemoteFileContents = (url: string) =>
    fetch(url).then(
        res => (`${res.status}`.startsWith("2") ? res.text() : undefined),
        () => undefined
    );
