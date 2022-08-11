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
            "version": "1.6.8"
        });

        assert(getValidImportUrlFactoryResult.couldConnect === true);

        const { versionFallbackWarning, getValidImportUrl } = getValidImportUrlFactoryResult;

        assert(typeof versionFallbackWarning === "undefined");

        assert((await getValidImportUrl({ "target": "DEFAULT EXPORT" })) === "https://raw.githubusercontent.com/garronej/evt/v1.6.8/mod.ts");
    }

    console.log("PASS");
})();
