"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModuleAddress_1 = require("../../lib/ModuleAddress");
const inDepth = require("evt/tools/inDepth");
const typeSafety_1 = require("evt/tools/typeSafety");
const getCurrentStdVersion_1 = require("../../lib/getCurrentStdVersion");
(async () => {
    const moduleAddress = {
        "type": "DENO.LAND URL",
        "isStd": true,
        "baseUrlWithoutBranch": "https://deno.land/std",
        "branch": undefined,
        "pathToIndex": "node/events.ts"
    };
    typeSafety_1.assert(inDepth.same(ModuleAddress_1.ModuleAddress.parse("https://deno.land/std/node/events.ts"), moduleAddress));
    typeSafety_1.assert(inDepth.same(ModuleAddress_1.ModuleAddress.parse("https://deno.land/std@master/node/events.ts"), { ...moduleAddress, "branch": "master" }));
    {
        const getValidImportUrlFactoryResult = await ModuleAddress_1.ModuleAddress.getValidImportUrlFactory({
            moduleAddress,
            "desc": "NO SPECIFIC VERSION PRESENT IN NODE_MODULE ( PROBABLY NODE BUILTIN)",
        });
        typeSafety_1.assert(getValidImportUrlFactoryResult.couldConnect === true);
        typeSafety_1.assert(getValidImportUrlFactoryResult.isDenoified === false &&
            getValidImportUrlFactoryResult.versionFallbackWarning === undefined);
        typeSafety_1.assert(await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
                `https://deno.land/std@${await getCurrentStdVersion_1.getCurrentStdVersion()}/node/events.ts`);
    }
    console.log("PASS");
})();
//# sourceMappingURL=test10.js.map