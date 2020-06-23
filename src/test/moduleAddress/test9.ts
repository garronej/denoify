
import { ModuleAddress } from "../../lib/ModuleAddress";

import * as inDepth from "evt/tools/inDepth";
import { assert } from "evt/tools/typeSafety";

(async () => {

    const moduleAddress: ModuleAddress.GitHubRawUrl = {
        "type": "GITHUB-RAW URL",
        "baseUrlWithoutBranch":
            "https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module",
        "branch": "0.2.0",
        "pathToIndex": "mod.ts"
    };

    assert(
        inDepth.same(
            ModuleAddress.parse("https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/0.2.0/mod.ts"),
            moduleAddress
        )
    );

    assert(
        inDepth.same(
            ModuleAddress.parse("https://raw.github.com/garronej/my_dummy_npm_and_deno_module/0.2.0/mod.ts"),
            moduleAddress
        )
    );


    {

        const getValidImportUrlFactoryResult = await ModuleAddress.getValidImportUrlFactory({
            moduleAddress,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULE",
            "version": "0.2.5"
        });

        assert(getValidImportUrlFactoryResult.couldConnect === true);

        assert(
            getValidImportUrlFactoryResult.isDenoified === true &&
            getValidImportUrlFactoryResult.versionFallbackWarning === undefined
        );

        assert(
            await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
            "https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/0.2.5/mod.ts"
        );

        assert(
            await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "dist/lib/Cat" })
            ===
            "https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/0.2.5/deno_dist/lib/Cat.ts"
        );

    }

    console.log("PASS");


})();