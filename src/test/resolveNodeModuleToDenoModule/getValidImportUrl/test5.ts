import { ModuleAddress } from "../../../lib/types/ModuleAddress";

import { assert } from "tsafe";
import { getValidImportUrlFactory } from "../../../lib/resolveNodeModuleToDenoModule";

//Makes sure it work when version tag is prefixed with a v.
(async () => {
    const expectedScheme: ModuleAddress.GitHubRepo = {
        "type": "GITHUB REPO",
        "userOrOrg": "garronej",
        "repositoryName": "evt",
        "branch": undefined
    } as const;

    {
        const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
            "moduleAddress": expectedScheme,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
            "version": "2.4.1"
        });

        assert(getValidImportUrlFactoryResult.couldConnect === true);

        const { versionFallbackWarning, getValidImportUrl } = getValidImportUrlFactoryResult;

        assert(typeof versionFallbackWarning === "undefined");

        assert((await getValidImportUrl({ "target": "DEFAULT EXPORT" })) === "https://deno.land/x/evt@v2.4.1/mod.ts");
    }

    console.log("PASS");
})();
