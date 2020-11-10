"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePathsWithWildcards = void 0;
const globProxy_1 = require("./globProxy");
const fs = require("fs");
const crawl_1 = require("./crawl");
const path = require("path");
async function resolvePathsWithWildcards(params) {
    const { pathWithWildcards } = params;
    const { globProxy } = globProxy_1.globProxyFactory({ "cwdAndRoot": "." });
    const flat = [
        (prev, curr) => [...prev, ...curr],
        []
    ];
    const resolvePaths = (pathWithWildcards) => Promise.all(pathWithWildcards
        .map(pathWithWildcard => globProxy({ pathWithWildcard }))).then(arrOfArr => arrOfArr
        .reduce(...flat)
        //Next op is to get the apropriate case in the outputs
        //Ex if we have README.md as input but readme.md is the
        //file that is actually there we want readme.md as output.
        .map(fileOrDirPath => path.join(path.dirname(fileOrDirPath), fs.readdirSync(path.dirname(fileOrDirPath))
        .find(basename => path.relative(basename, path.basename(fileOrDirPath)) === "")))
        .map(fileOrDirPath => !fs.lstatSync(fileOrDirPath).isDirectory() ?
        [fileOrDirPath]
        :
            crawl_1.crawl(fileOrDirPath)
                .map(filePath => path.join(fileOrDirPath, filePath)))
        .reduce(...flat));
    const filesToInclude = await resolvePaths(pathWithWildcards
        .filter(p => !p.startsWith("!")));
    const filesToExclude = await resolvePaths(pathWithWildcards
        .filter(p => p.startsWith("!"))
        .map(p => p.replace(/^\!/, "")));
    return Array.from(new Set(filesToInclude
        .filter(p => !filesToExclude.includes(p))));
}
exports.resolvePathsWithWildcards = resolvePathsWithWildcards;
//# sourceMappingURL=resolvePathsWithWildcards.js.map