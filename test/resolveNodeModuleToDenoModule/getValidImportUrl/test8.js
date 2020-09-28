"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModuleAddress_1 = require("../../../lib/types/ModuleAddress");
const inDepth = require("evt/tools/inDepth");
const typeSafety_1 = require("evt/tools/typeSafety");
const resolveNodeModuleToDenoModule_1 = require("../../../lib/resolveNodeModuleToDenoModule");
(async () => {
    const moduleAddress = {
        "type": "GITHUB-RAW URL",
        "baseUrlWithoutBranch": "https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module",
        "branch": "v0.2.0",
        "pathToIndex": "deno_dist/mod.ts"
    };
    typeSafety_1.assert(inDepth.same(ModuleAddress_1.ModuleAddress.parse("https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/v0.2.0/deno_dist/mod.ts"), moduleAddress));
    typeSafety_1.assert(inDepth.same(ModuleAddress_1.ModuleAddress.parse("https://raw.github.com/garronej/my_dummy_npm_and_deno_module/v0.2.0/deno_dist/mod.ts"), moduleAddress));
    {
        const getValidImportUrlFactoryResult = await resolveNodeModuleToDenoModule_1.getValidImportUrlFactory({
            moduleAddress,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULE",
            "version": "v0.2.9"
        });
        typeSafety_1.assert(getValidImportUrlFactoryResult.couldConnect === true);
        typeSafety_1.assert(getValidImportUrlFactoryResult.versionFallbackWarning === undefined);
        console.log(await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "DEFAULT EXPORT" }));
        typeSafety_1.assert(await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
                "https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/v0.2.9/deno_dist/mod.ts");
        try {
            await getValidImportUrlFactoryResult.getValidImportUrl({
                "target": "SPECIFIC FILE",
                "specificImportPath": "dist/lib/Cat"
            });
            typeSafety_1.assert(false);
        }
        catch (_a) {
            //Couldn't find 
            //     https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/v0.2.9/dist/lib/Cat.ts
            // nor https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/v0.2.9/dist/lib/Cat/index.ts
        }
    }
    console.log("PASS");
})();
//# sourceMappingURL=test8.js.map