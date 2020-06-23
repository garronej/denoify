


import { ModuleAddress } from "../../lib/ModuleAddress";

import { assert } from "evt/tools/typeSafety";

//Makes sure it work when version tag is prefixed with a v.
(async () => {

    const expectedScheme: ModuleAddress.GitHubRepo = {
        "type": "GITHUB REPO",
        "userOrOrg": "garronej",
        "repositoryName": "evt",
        "branch": undefined
    } as const;


    {

        const getValidImportUrlFactoryResult = await ModuleAddress.getValidImportUrlFactory({
            "moduleAddress": expectedScheme,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULE",
            "version": "1.6.8"
        });

        assert(getValidImportUrlFactoryResult.couldConnect === true);

        const { versionFallbackWarning, isDenoified, getValidImportUrl } = getValidImportUrlFactoryResult;

        assert((
            isDenoified === true &&
            typeof versionFallbackWarning === "undefined"
        ));

        assert(
            await getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
            "https://raw.githubusercontent.com/garronej/evt/v1.6.8/mod.ts"
        );


    }

    console.log("PASS");

})();