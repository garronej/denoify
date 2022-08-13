import { ModuleAddress } from "../../../lib/types/ModuleAddress";
import { assert } from "tsafe/assert";
import { id } from "tsafe/id";
import { getValidImportUrlFactory } from "../../../lib/resolveNodeModuleToDenoModule";

//Makes sure it work when version tag is prefixed with a v.
(async () => {
    {
        const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
            "moduleAddress": id<ModuleAddress.GitHubRepo>({
                "type": "GITHUB REPO",
                "userOrOrg": "garronej",
                //"userOrOrg": "mxxii",
                "repositoryName": "leac",
                "branch": undefined
            }),
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
            "version": "0.5.0"
        });

        assert(getValidImportUrlFactoryResult.couldConnect === true);

        const { versionFallbackWarning, getValidImportUrl } = getValidImportUrlFactoryResult;

        //assert(versionFallbackWarning === undefined);
        assert(versionFallbackWarning !== undefined);

        //assert((await getValidImportUrl({ "target": "DEFAULT EXPORT" })) === "https://raw.githubusercontent.com/garronej/leac/v0.5.0/deno/mod.ts");
        assert((await getValidImportUrl({ "target": "DEFAULT EXPORT" })) === "https://raw.githubusercontent.com/garronej/leac/main/deno/mod.ts");
    }

    console.log("PASS");
})();
