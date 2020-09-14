"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resolveNodeModuleToDenoModule_1 = require("../../../lib/resolveNodeModuleToDenoModule");
const githubTags_1 = require("../../../tools/githubTags");
const typeSafety_1 = require("evt/tools/typeSafety");
(async () => {
    const moduleAddress = {
        "type": "GITHUB REPO",
        "userOrOrg": "garronej",
        "repositoryName": "ts-md5",
        "branch": undefined
    };
    const getValidImportUrlFactoryResult = await resolveNodeModuleToDenoModule_1.getValidImportUrlFactory({
        "moduleAddress": moduleAddress,
        "desc": "MATCH VERSION INSTALLED IN NODE_MODULE",
        "version": "99.99.99"
    });
    typeSafety_1.assert(getValidImportUrlFactoryResult.couldConnect === true);
    const { versionFallbackWarning, getValidImportUrl } = getValidImportUrlFactoryResult;
    typeSafety_1.assert(typeof versionFallbackWarning === "string");
    const latestTag = await githubTags_1.getLatestTag({
        "owner": moduleAddress.userOrOrg,
        "repo": moduleAddress.repositoryName
    });
    typeSafety_1.assert(latestTag !== undefined);
    typeSafety_1.assert(await getValidImportUrl({ "target": "DEFAULT EXPORT" })
        ===
            `https://raw.githubusercontent.com/garronej/ts-md5/${latestTag}/deno_dist/mod.ts`);
    typeSafety_1.assert(await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "dist/parallel_hasher" })
        ===
            `https://raw.githubusercontent.com/garronej/ts-md5/${latestTag}/deno_dist/parallel_hasher.ts`);
    for (const specificImportPath of ["./dist/parallel_hasher", "dist/parallel_hasher", "./parallel_hasher", "parallel_hasher"]) {
        typeSafety_1.assert(await getValidImportUrl({ "target": "SPECIFIC FILE", specificImportPath })
            ===
                `https://raw.githubusercontent.com/garronej/ts-md5/${latestTag}/deno_dist/parallel_hasher.ts`);
    }
    console.log("PASS");
})();
//# sourceMappingURL=test2.js.map