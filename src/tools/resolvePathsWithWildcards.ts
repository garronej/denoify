import { globProxyFactory } from "./globProxy";
import * as fs from "fs";
import { crawl } from "./crawl";
import * as path from "path";

export function resolvePathsWithWildcards(params: { pathWithWildcards: string[] }): string[] {
    const { pathWithWildcards } = params;

    const { globProxy } = globProxyFactory({ "cwdAndRoot": "." });

    const resolvePaths = (pathWithWildcards: string[]): string[] =>
        pathWithWildcards
            .flatMap(pathWithWildcard => globProxy({ pathWithWildcard }))
            //Next op is to get the apropriate case in the outputs
            //Ex if we have README.md as input but readme.md is the
            //file that is actually there we want readme.md as output.
            .map(fileOrDirPath =>
                path.join(
                    path.dirname(fileOrDirPath),
                    fs.readdirSync(path.dirname(fileOrDirPath)).find(basename => path.relative(basename, path.basename(fileOrDirPath)) === "")!
                )
            )
            .flatMap(fileOrDirPath =>
                !fs.lstatSync(fileOrDirPath).isDirectory()
                    ? [fileOrDirPath]
                    : crawl(fileOrDirPath).map(filePath => path.join(fileOrDirPath, filePath))
            );
    const filesToInclude = resolvePaths(pathWithWildcards.filter(p => !p.startsWith("!")));

    const filesToExclude = resolvePaths(pathWithWildcards.filter(p => p.startsWith("!")).map(p => p.replace(/^\!/, "")));

    return Array.from(new Set(filesToInclude.filter(p => !filesToExclude.includes(p))));
}
