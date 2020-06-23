"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModuleAddress_1 = require("../../lib/ModuleAddress");
const inDepth = require("evt/tools/inDepth");
const typeSafety_1 = require("evt/tools/typeSafety");
(async () => {
    const moduleAddress = {
        "type": "GITHUB-RAW URL",
        "baseUrlWithoutBranch": "https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module",
        "branch": "0.2.0",
        "pathToIndex": "mod.ts"
    };
    typeSafety_1.assert(inDepth.same(ModuleAddress_1.ModuleAddress.parse("https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/0.2.0/mod.ts"), moduleAddress));
    typeSafety_1.assert(inDepth.same(ModuleAddress_1.ModuleAddress.parse("https://raw.github.com/garronej/my_dummy_npm_and_deno_module/0.2.0/mod.ts"), moduleAddress));
    {
        const getValidImportUrlFactoryResult = await ModuleAddress_1.ModuleAddress.getValidImportUrlFactory({
            moduleAddress,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULE",
            "version": "0.2.5"
        });
        typeSafety_1.assert(getValidImportUrlFactoryResult.couldConnect === true);
        typeSafety_1.assert(getValidImportUrlFactoryResult.isDenoified === true &&
            getValidImportUrlFactoryResult.versionFallbackWarning === undefined);
        typeSafety_1.assert(await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
                "https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/0.2.5/mod.ts");
        typeSafety_1.assert(await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "dist/lib/Cat" })
            ===
                "https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/0.2.5/deno_dist/lib/Cat.ts");
    }
    console.log("PASS");
})();
//# sourceMappingURL=test9.js.map