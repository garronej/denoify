import { ModuleAddress } from "../../../lib/types/ModuleAddress";

import * as inDepth from "evt/tools/inDepth";
import { assert } from "tsafe";
import { getValidImportUrlFactory } from "../../../lib/resolveNodeModuleToDenoModule";
import { getLatestTag } from "../../../tools/githubTags";

(async () => {
    const moduleAddress: ModuleAddress.DenoLandUrl = {
        "type": "DENO.LAND URL",
        "isStd": false,
        "pathToIndex": "js-yaml.js",
        "baseUrlWithoutBranch": "https://deno.land/x/js_yaml_port",
        "branch": undefined
    };

    assert(inDepth.same(ModuleAddress.parse("https://deno.land/x/js_yaml_port/js-yaml.js"), moduleAddress));

    {
        const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
            moduleAddress,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULE",
            "version": "99.99.99"
        });

        assert(getValidImportUrlFactoryResult.couldConnect === true);

        assert(typeof getValidImportUrlFactoryResult.versionFallbackWarning === "string");

        const latestTag = await getLatestTag({ "owner": "KSXGitHub", "repo": "simple-js-yaml-port-for-deno" });

        assert(
            (await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })) ===
                `https://deno.land/x/js_yaml_port@${latestTag}/js-yaml.js`
        );
    }

    console.log("PASS");
})();
