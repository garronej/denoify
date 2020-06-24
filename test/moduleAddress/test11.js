"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModuleAddress_1 = require("../../lib/ModuleAddress");
const inDepth = require("evt/tools/inDepth");
const typeSafety_1 = require("evt/tools/typeSafety");
const getCurrentStdVersion_1 = require("../../lib/getCurrentStdVersion");
//When this is installed: https://www.npmjs.com/package/buffer 
//We should still resolve the std without trying to match the version
(async () => {
    const moduleAddress = {
        "type": "DENO.LAND URL",
        "isStd": true,
        "baseUrlWithoutBranch": "https://deno.land/std",
        "branch": undefined,
        "pathToIndex": "node/buffer.ts"
    };
    typeSafety_1.assert(inDepth.same(ModuleAddress_1.ModuleAddress.parse("https://deno.land/std/node/buffer.ts"), moduleAddress));
    typeSafety_1.assert(inDepth.same(ModuleAddress_1.ModuleAddress.parse("https://deno.land/std@master/node/buffer.ts"), { ...moduleAddress, "branch": "master" }));
    {
        const getValidImportUrlFactoryResult = await ModuleAddress_1.ModuleAddress.getValidImportUrlFactory({
            moduleAddress,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULE",
            "version": "0.55.0"
            //https://deno.land/std/node/buffer.ts we voluntarily take a version that exist 
            //on deno.land ( event if it is note a valid npm buffer version).
            //to ensure that it does not resolve.
        });
        typeSafety_1.assert(getValidImportUrlFactoryResult.couldConnect === true);
        typeSafety_1.assert(getValidImportUrlFactoryResult.isDenoified === false &&
            getValidImportUrlFactoryResult.versionFallbackWarning === undefined);
        typeSafety_1.assert(await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
                `https://deno.land/std@${await getCurrentStdVersion_1.getCurrentStdVersion()}/node/buffer.ts`);
    }
    console.log("PASS");
})();
//# sourceMappingURL=test11.js.map