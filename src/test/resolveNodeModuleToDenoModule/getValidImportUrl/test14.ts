import { ModuleAddress } from "../../../lib/types/ModuleAddress";
import { assert } from "tsafe";
import { getValidImportUrlFactory } from "../../../lib/resolveNodeModuleToDenoModule";

(async () => {
    const userOrOrg = "garronej";
    const repositoryName = "my_dummy_npm_and_deno_module_test_config_file_3";
    const moduleAddress: ModuleAddress.GitHubRepo = {
        "type": "GITHUB REPO",
        userOrOrg,
        repositoryName,
        "branch": undefined
    };

    {
        const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
            moduleAddress,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
            "version": "1.0.0"
        });

        assert(getValidImportUrlFactoryResult.couldConnect === true);

        assert(getValidImportUrlFactoryResult.versionFallbackWarning === undefined);

        assert(
            (await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })) ===
                `https://raw.githubusercontent.com/${userOrOrg}/${repositoryName}/1.0.0/custom_deno_dist_dir_name/mod.ts`
        );
        assert(
            (await getValidImportUrlFactoryResult.getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "dist/lib/Cat" })) ===
                `https://raw.githubusercontent.com/${userOrOrg}/${repositoryName}/1.0.0/custom_deno_dist_dir_name/lib/Cat.ts`
        );
    }

    console.log("PASS");
})();
