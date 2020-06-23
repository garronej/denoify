
import { ModuleAddress } from "../../lib/ModuleAddress";

import * as inDepth from "evt/tools/inDepth";
import { assert } from "evt/tools/typeSafety";
import { getCurrentStdVersion } from "../../lib/getCurrentStdVersion";

(async () => {

    const moduleAddress: ModuleAddress.DenoLandUrl = {
        "type": "DENO.LAND URL",
        "isStd": true,
        "baseUrlWithoutBranch": "https://deno.land/std",
        "branch": undefined,
        "pathToIndex": "node/events.ts"
    };

    assert(
        inDepth.same(
            ModuleAddress.parse("https://deno.land/std/node/events.ts"),
            moduleAddress
        )
    );

    assert(
        inDepth.same(
            ModuleAddress.parse("https://deno.land/std@master/node/events.ts"),
            { ...moduleAddress, "branch": "master" }
        )
    );

    {

        const getValidImportUrlFactoryResult = await ModuleAddress.getValidImportUrlFactory({
            moduleAddress,
            "desc": "NO SPECIFIC VERSION PRESENT IN NODE_MODULE ( PROBABLY NODE BUILTIN)",
        });

        assert(getValidImportUrlFactoryResult.couldConnect === true);

        assert(
            getValidImportUrlFactoryResult.isDenoified === false &&
            getValidImportUrlFactoryResult.versionFallbackWarning === undefined
        );

        assert(
            await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
            `https://deno.land/std@${await getCurrentStdVersion()}/node/events.ts`
        );

    }

    console.log("PASS");

})();