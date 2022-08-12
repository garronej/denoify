import { ModuleAddress } from "../../../lib/types/ModuleAddress";
import { assert } from "tsafe";
import { getValidImportUrlFactory } from "../../../lib/resolveNodeModuleToDenoModule";

(async () => {
    const moduleAddress: ModuleAddress.GitHubRepo = {
        "type": "GITHUB REPO",
        "userOrOrg": "garronej",
        "repositoryName": "my_dummy_npm_and_deno_module",
        "branch": undefined
    };

    {
        const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
            moduleAddress,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
            "version": "0.4.3"
        });

        assert(getValidImportUrlFactoryResult.couldConnect === true);

        assert(getValidImportUrlFactoryResult.versionFallbackWarning === undefined);

        assert(
            (await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })) ===
                "https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/v0.4.3/deno_dist/mod.ts"
        );
        assert(
            (await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "dist/lib/Cat" })) ===
                "https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/v0.4.3/deno_dist/lib/Cat.ts"
        );
    }

    console.log("PASS");
})();
