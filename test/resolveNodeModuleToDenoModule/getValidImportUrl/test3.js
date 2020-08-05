"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeSafety_1 = require("evt/tools/typeSafety");
const resolveNodeModuleToDenoModule_1 = require("../../../lib/resolveNodeModuleToDenoModule");
(async () => {
    const moduleAddress = {
        "type": "GITHUB REPO",
        "userOrOrg": "garronej",
        "repositoryName": "ts-md5",
        "branch": undefined
    };
    {
        const getValidImportUrlFactoryResult = await resolveNodeModuleToDenoModule_1.getValidImportUrlFactory({
            "moduleAddress": moduleAddress,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULE",
            "version": "1.2.7"
        });
        typeSafety_1.assert(getValidImportUrlFactoryResult.couldConnect === true);
        const { versionFallbackWarning, isDenoified, getValidImportUrl } = getValidImportUrlFactoryResult;
        typeSafety_1.assert((isDenoified === true &&
            typeof versionFallbackWarning === "undefined"));
        typeSafety_1.assert(await getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
                "https://raw.githubusercontent.com/garronej/ts-md5/1.2.7/mod.ts");
        typeSafety_1.assert(await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "dist/parallel_hasher" })
            ===
                "https://raw.githubusercontent.com/garronej/ts-md5/1.2.7/deno_dist/parallel_hasher.ts");
    }
    console.log("PASS");
})();
//# sourceMappingURL=test3.js.map