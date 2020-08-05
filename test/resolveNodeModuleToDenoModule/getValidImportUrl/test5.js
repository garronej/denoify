"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeSafety_1 = require("evt/tools/typeSafety");
const resolveNodeModuleToDenoModule_1 = require("../../../lib/resolveNodeModuleToDenoModule");
(async () => {
    const expectedScheme = {
        "type": "GITHUB REPO",
        "userOrOrg": "garronej",
        "repositoryName": "evt",
        "branch": undefined
    };
    {
        const getValidImportUrlFactoryResult = await resolveNodeModuleToDenoModule_1.getValidImportUrlFactory({
            "moduleAddress": expectedScheme,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULE",
            "version": "99.99.99"
        });
        typeSafety_1.assert(getValidImportUrlFactoryResult.couldConnect === true);
        const { versionFallbackWarning, isDenoified, getValidImportUrl } = getValidImportUrlFactoryResult;
        typeSafety_1.assert((isDenoified === true &&
            typeof versionFallbackWarning === "string"));
        typeSafety_1.assert(await getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
                "https://raw.githubusercontent.com/garronej/evt/master/mod.ts");
        typeSafety_1.assert(await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "tools/typeSafety" })
            ===
                "https://raw.githubusercontent.com/garronej/evt/master/tools/typeSafety/index.ts");
        typeSafety_1.assert(await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "tools/typeSafety/assert" })
            ===
                "https://raw.githubusercontent.com/garronej/evt/master/tools/typeSafety/assert.ts");
    }
    console.log("PASS");
})();
//# sourceMappingURL=test5.js.map