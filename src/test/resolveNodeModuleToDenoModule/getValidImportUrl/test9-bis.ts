import { ModuleAddress } from "../../../lib/types/ModuleAddress";

import * as inDepth from "evt/tools/inDepth";
import { assert } from "tsafe";
import { getCurrentStdVersion } from "../../../lib/getCurrentStdVersion";
import { getValidImportUrlFactory } from "../../../lib/resolveNodeModuleToDenoModule";

(async () => {
    const moduleAddress: ModuleAddress.DenoLandUrl = {
        "type": "DENO.LAND URL",
        "isStd": true,
        "baseUrlWithoutBranch": "https://deno.land/std",
        "branch": undefined,
        "pathToIndex": "node/fs.ts"
    };

    assert(inDepth.same(ModuleAddress.parse("https://deno.land/std/node/fs.ts"), moduleAddress));

    assert(inDepth.same(ModuleAddress.parse("https://deno.land/std@0.153.0/node/fs.ts"), { ...moduleAddress, "branch": "0.153.0" }));

    {
        const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
            moduleAddress,
            "desc": "NOT LISTED AS A DEPENDENCY (PROBABLY NODE BUILTIN)"
        });

        assert(getValidImportUrlFactoryResult.couldConnect === true);

        assert(getValidImportUrlFactoryResult.versionFallbackWarning === undefined);

        assert(
            (await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })) ===
                `https://deno.land/std@${await getCurrentStdVersion()}/node/fs.ts`
        );

        assert(
            (await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "promises" })) ===
                `https://deno.land/std@${await getCurrentStdVersion()}/node/fs/promises.ts`
        );
    }

    console.log("PASS");
})();
