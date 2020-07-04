"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModuleAddress_1 = require("../../lib/ModuleAddress");
const typeSafety_1 = require("evt/tools/typeSafety");
//Makes sure it work when version tag is prefixed with a v.
(async () => {
    const expectedScheme = {
        "type": "GITHUB REPO",
        "userOrOrg": "garronej",
        "repositoryName": "evt",
        "branch": undefined
    };
    {
        const getValidImportUrlFactoryResult = await ModuleAddress_1.ModuleAddress.getValidImportUrlFactory({
            "moduleAddress": expectedScheme,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULE",
            "version": "1.6.8"
        });
        typeSafety_1.assert(getValidImportUrlFactoryResult.couldConnect === true);
        const { versionFallbackWarning, isDenoified, getValidImportUrl } = getValidImportUrlFactoryResult;
        typeSafety_1.assert((isDenoified === true &&
            typeof versionFallbackWarning === "undefined"));
        typeSafety_1.assert(await getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
                "https://raw.githubusercontent.com/garronej/evt/v1.6.8/mod.ts");
    }
    console.log("PASS");
})();
//# sourceMappingURL=test6.js.map