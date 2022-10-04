import { ModuleAddress } from "../../../lib/types/ModuleAddress";
import { assert } from "tsafe";
import { getValidImportUrlFactory } from "../../../lib/resolveNodeModuleToDenoModule";

(async () => {
    const userOrOrg = "GervinFung";
    const moduleAddress: ModuleAddress.GitHubRepo = {
        "type": "GITHUB REPO",
        userOrOrg,
        "repositoryName": "my_dummy_npm_and_deno_module",
        "branch": "master"
    };

    {
        const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
            moduleAddress,
            "desc": "NOT LISTED AS A DEPENDENCY (PROBABLY NODE BUILTIN)"
        });

        assert(getValidImportUrlFactoryResult.couldConnect === true);

        assert(getValidImportUrlFactoryResult.versionFallbackWarning === undefined);

        assert(
            (await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })) ===
                `https://raw.githubusercontent.com/${userOrOrg}/my_dummy_npm_and_deno_module/master/deno_dist/mod.ts`
        );
        assert(
            (await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "dist/lib/Cat" })) ===
                `https://raw.githubusercontent.com/${userOrOrg}/my_dummy_npm_and_deno_module/master/deno_dist/lib/Cat.ts`
        );
    }

    console.log("PASS");
})();
