import * as fs from "fs";
import { join as pathJoin } from "path";
import fetch from "node-fetch";
import { ModuleAddress } from "../lib/types/ModuleAddress";
import { buildUrlFactory } from "../lib/resolveNodeModuleToDenoModule/getValidImportUrlFactory";

export const getLocalFileContents = async ({ moduleDirPath, fileBaseName }: { moduleDirPath: string; fileBaseName: string }) => {
    try {
        const filePath = pathJoin(moduleDirPath, fileBaseName);
        fs.accessSync(filePath);
        return fs.readFileSync(filePath, { encoding: "utf8" });
    } catch {
        return undefined;
    }
};

export const getRemoteFileContents = ({
    committish,
    filename,
    moduleAddress
}: {
    committish: string;
    filename: string;
    moduleAddress: ModuleAddress;
}) => {
    const buildUrl = buildUrlFactory({ moduleAddress });
    const url = buildUrl({ candidateBranch: committish, pathToFile: filename });

    return fetch(url).then(
        res => (`${res.status}`.startsWith("2") ? res.text() : undefined),
        () => undefined
    );
};
