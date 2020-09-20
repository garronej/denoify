"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeSafety_1 = require("evt/tools/typeSafety");
const resolveNodeModuleToDenoModule_1 = require("../../../lib/resolveNodeModuleToDenoModule");
const getThirdPartyDenoModuleInfos_1 = require("../../../lib/getThirdPartyDenoModuleInfos");
(async () => {
    const moduleAddress = {
        "type": "GITHUB REPO",
        "userOrOrg": "garronej",
        "repositoryName": "evt",
        "branch": undefined
    };
    {
        const getValidImportUrlFactoryResult = await resolveNodeModuleToDenoModule_1.getValidImportUrlFactory({
            "moduleAddress": moduleAddress,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULE",
            "version": "99.99.99"
        });
        typeSafety_1.assert(getValidImportUrlFactoryResult.couldConnect === true);
        const { versionFallbackWarning, getValidImportUrl } = getValidImportUrlFactoryResult;
        typeSafety_1.assert(typeof versionFallbackWarning === "string");
        const { latestVersion } = (await getThirdPartyDenoModuleInfos_1.getThirdPartyDenoModuleInfos({ "denoModuleName": "evt" }));
        typeSafety_1.assert(await getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
                `https://raw.githubusercontent.com/garronej/evt/${latestVersion}/deno_dist/mod.ts`);
        typeSafety_1.assert(await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "tools/typeSafety" })
            ===
                `https://raw.githubusercontent.com/garronej/evt/${latestVersion}/deno_dist/tools/typeSafety/index.ts`);
        typeSafety_1.assert(await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "tools/typeSafety/assert" })
            ===
                `https://raw.githubusercontent.com/garronej/evt/${latestVersion}/deno_dist/tools/typeSafety/assert.ts`);
    }
    console.log("PASS");
})();
//# sourceMappingURL=test4.js.map