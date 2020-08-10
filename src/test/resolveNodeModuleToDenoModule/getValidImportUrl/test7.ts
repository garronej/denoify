import { ModuleAddress } from "../../../lib/types/ModuleAddress";

import * as inDepth from "evt/tools/inDepth";
import { assert } from "evt/tools/typeSafety";
import { getValidImportUrlFactory } from "../../../lib/resolveNodeModuleToDenoModule";

(async () => {

    const moduleAddress: ModuleAddress.DenoLandUrl = {
        "type": "DENO.LAND URL",
        "isStd": false,
        "pathToIndex": "js-yaml.js",
        "baseUrlWithoutBranch": "https://deno.land/x/js_yaml_port",
        "branch": undefined
    };

    assert(
        inDepth.same(
            ModuleAddress.parse("https://deno.land/x/js_yaml_port/js-yaml.js"),
            moduleAddress
        )
    );

    {

        const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
            moduleAddress,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULE",
            "version": "3.14.0"
        });

        assert(getValidImportUrlFactoryResult.couldConnect === true);

        assert(getValidImportUrlFactoryResult.versionFallbackWarning === undefined);

        assert(
            await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
            "https://deno.land/x/js_yaml_port@3.14.0/js-yaml.js"
        );

    }

    console.log("PASS");

})();