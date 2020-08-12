"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModuleAddress_1 = require("../../../lib/types/ModuleAddress");
const inDepth = require("evt/tools/inDepth");
const typeSafety_1 = require("evt/tools/typeSafety");
const resolveNodeModuleToDenoModule_1 = require("../../../lib/resolveNodeModuleToDenoModule");
const githubTags_1 = require("../../../tools/githubTags");
(async () => {
    const moduleAddress = {
        "type": "DENO.LAND URL",
        "isStd": false,
        "pathToIndex": "js-yaml.js",
        "baseUrlWithoutBranch": "https://deno.land/x/js_yaml_port",
        "branch": undefined
    };
    typeSafety_1.assert(inDepth.same(ModuleAddress_1.ModuleAddress.parse("https://deno.land/x/js_yaml_port/js-yaml.js"), moduleAddress));
    {
        const getValidImportUrlFactoryResult = await resolveNodeModuleToDenoModule_1.getValidImportUrlFactory({
            moduleAddress,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULE",
            "version": "99.99.99"
        });
        typeSafety_1.assert(getValidImportUrlFactoryResult.couldConnect === true);
        typeSafety_1.assert(typeof getValidImportUrlFactoryResult.versionFallbackWarning === "string");
        const latestTag = await githubTags_1.getLatestTag({ "owner": "KSXGitHub", "repo": "simple-js-yaml-port-for-deno" });
        typeSafety_1.assert(await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
                `https://deno.land/x/js_yaml_port@${latestTag}/js-yaml.js`);
    }
    console.log("PASS");
})();
//# sourceMappingURL=test6.js.map