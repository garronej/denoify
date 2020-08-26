
import { globProxyFactory } from "./globProxy";
import * as fs from "fs";
import { crawl } from "./crawl";
import * as path from "path";

export async function resolvePathsWithWildcards(
    params: {
        pathWithWildcards: string[];
    }
): Promise<string[]> {

    const { pathWithWildcards } = params;

    const { globProxy } = globProxyFactory({ "cwdAndRoot": "." });

    const flat = [
        (prev: string[], curr: string[]) => [...prev, ...curr],
        [] as string[]
    ] as const;

    const resolvePaths = (pathWithWildcards: string[]): Promise<string[]> =>
        Promise.all(
            pathWithWildcards
                .map(pathWithWildcard => globProxy({ pathWithWildcard }))
        ).then(
            arrOfArr =>
                arrOfArr
                    .reduce(...flat)
                    .map(
                        fileOrDirPath =>
                            !fs.lstatSync(fileOrDirPath).isDirectory() ?
                                [fileOrDirPath]
                                :
                                crawl(fileOrDirPath)
                                    .map(filePath => path.join(fileOrDirPath, filePath))
                    )
                    .reduce(...flat)
        );

    const filesToInclude = await resolvePaths(
        pathWithWildcards
            .filter(p => !p.startsWith("!"))
    );

    const filesToExclude = await resolvePaths(
        pathWithWildcards
            .filter(p => p.startsWith("!"))
            .map(p => p.replace(/^\!/, ""))
    );

    return Array.from(
        new Set(
            filesToInclude
                .filter(p => !filesToExclude.includes(p))
        )
    );

}
