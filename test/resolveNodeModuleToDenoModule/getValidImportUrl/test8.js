"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModuleAddress_1 = require("../../../lib/types/ModuleAddress");
const inDepth = require("evt/tools/inDepth");
const typeSafety_1 = require("evt/tools/typeSafety");
const resolveNodeModuleToDenoModule_1 = require("../../../lib/resolveNodeModuleToDenoModule");
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
            "version": "3.14.0"
        });
        typeSafety_1.assert(getValidImportUrlFactoryResult.couldConnect === true);
        typeSafety_1.assert(getValidImportUrlFactoryResult.isDenoified === false &&
            getValidImportUrlFactoryResult.versionFallbackWarning === undefined);
        typeSafety_1.assert(await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
                "https://deno.land/x/js_yaml_port@3.14.0/js-yaml.js");
    }
    console.log("PASS");
})();
//# sourceMappingURL=test8.js.map