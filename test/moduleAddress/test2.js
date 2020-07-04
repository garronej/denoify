"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModuleAddress_1 = require("../../lib/ModuleAddress");
const typeSafety_1 = require("evt/tools/typeSafety");
(async () => {
    const moduleAddress = {
        "type": "GITHUB REPO",
        "userOrOrg": "garronej",
        "repositoryName": "ts-md5",
        "branch": undefined
    };
    const getValidImportUrlFactoryResult = await ModuleAddress_1.ModuleAddress.getValidImportUrlFactory({
        "moduleAddress": moduleAddress,
        "desc": "MATCH VERSION INSTALLED IN NODE_MODULE",
        "version": "99.99.99"
    });
    typeSafety_1.assert(getValidImportUrlFactoryResult.couldConnect === true);
    const { versionFallbackWarning, isDenoified, getValidImportUrl } = getValidImportUrlFactoryResult;
    typeSafety_1.assert((isDenoified === true &&
        typeof versionFallbackWarning === "string"));
    typeSafety_1.assert(await getValidImportUrl({ "target": "DEFAULT EXPORT" })
        ===
            "https://raw.githubusercontent.com/garronej/ts-md5/master/mod.ts");
    typeSafety_1.assert(await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "dist/parallel_hasher" })
        ===
            "https://raw.githubusercontent.com/garronej/ts-md5/master/deno_dist/parallel_hasher.ts");
    typeSafety_1.assert(await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "./dist/parallel_hasher" })
        ===
            "https://raw.githubusercontent.com/garronej/ts-md5/master/deno_dist/parallel_hasher.ts");
    console.log("PASS");
})();
//# sourceMappingURL=test2.js.map