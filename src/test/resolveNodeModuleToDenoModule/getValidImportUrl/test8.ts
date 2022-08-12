import { ModuleAddress } from "../../../lib/types/ModuleAddress";

import * as inDepth from "evt/tools/inDepth";
import { assert } from "tsafe";
import { getValidImportUrlFactory } from "../../../lib/resolveNodeModuleToDenoModule";

(async () => {
    const moduleAddress: ModuleAddress.GitHubRawUrl = {
        "type": "GITHUB-RAW URL",
        "baseUrlWithoutBranch": "https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module",
        "branch": "v0.2.0",
        "pathToIndex": "deno_dist/mod.ts"
    };

    assert(
        inDepth.same(
            ModuleAddress.parse("https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/v0.2.0/deno_dist/mod.ts"),
            moduleAddress
        )
    );

    assert(inDepth.same(ModuleAddress.parse("https://raw.github.com/garronej/my_dummy_npm_and_deno_module/v0.2.0/deno_dist/mod.ts"), moduleAddress));

    {
        const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
            moduleAddress,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
            "version": "v0.2.9"
        });

        assert(getValidImportUrlFactoryResult.couldConnect === true);

        assert(getValidImportUrlFactoryResult.versionFallbackWarning === undefined);

        assert(
            (await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })) ===
                "https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/v0.2.9/deno_dist/mod.ts"
        );

        try {
            const x = await getValidImportUrlFactoryResult.getValidImportUrl({
                "target": "SPECIFIC FILE",
                "specificImportPath": "dist/lib/Cat"
            });

            assert(false);
        } catch {
            //Couldn't find
            //     https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/v0.2.9/dist/lib/Cat.ts
            // nor https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/v0.2.9/dist/lib/Cat/index.ts
        }
    }

    console.log("PASS");
})();
