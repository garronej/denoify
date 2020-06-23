import { ModuleAddress } from "../../lib/ModuleAddress";
import { assert } from "evt/tools/typeSafety";

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
            "version": "99.99.99"
        });

        assert(getValidImportUrlFactoryResult.couldConnect === true);

        const { versionFallbackWarning, isDenoified, getValidImportUrl } = getValidImportUrlFactoryResult;

        assert((
            isDenoified === true &&
            typeof versionFallbackWarning === "string"
        ));

        assert(
            await getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
            "https://raw.githubusercontent.com/garronej/evt/master/mod.ts"
        );



        assert(
            await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "tools/typeSafety" })
            ===
            "https://raw.githubusercontent.com/garronej/evt/master/tools/typeSafety/index.ts"
        );

        assert(
            await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "tools/typeSafety/assert" })
            ===
            "https://raw.githubusercontent.com/garronej/evt/master/tools/typeSafety/assert.ts"
        );


    }


    console.log("PASS");

})();