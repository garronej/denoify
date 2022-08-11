import { ModuleAddress } from "../../../lib/types/ModuleAddress";
import { assert } from "tsafe";
import { getValidImportUrlFactory } from "../../../lib/resolveNodeModuleToDenoModule";
import { getThirdPartyDenoModuleInfos } from "../../../lib/getThirdPartyDenoModuleInfos";

(async () => {
    const moduleAddress: ModuleAddress.GitHubRepo = {
        "type": "GITHUB REPO",
        "userOrOrg": "garronej",
        "repositoryName": "evt",
        "branch": undefined
    } as const;

    {
        const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
            "moduleAddress": moduleAddress,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
            "version": "99.99.99"
        });

        assert(getValidImportUrlFactoryResult.couldConnect === true);

        const { versionFallbackWarning, getValidImportUrl } = getValidImportUrlFactoryResult;

        assert(typeof versionFallbackWarning === "string");

        const { latestVersion } = (await getThirdPartyDenoModuleInfos({ "denoModuleName": "evt" }))!;

        assert(
            (await getValidImportUrl({ "target": "DEFAULT EXPORT" })) ===
                `https://raw.githubusercontent.com/garronej/evt/${latestVersion}/deno_dist/mod.ts`
        );

        assert(
            (await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "tools/typeSafety" })) ===
                `https://raw.githubusercontent.com/garronej/evt/${latestVersion}/deno_dist/tools/typeSafety/index.ts`
        );

        assert(
            (await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "tools/typeSafety/assert" })) ===
                `https://raw.githubusercontent.com/garronej/evt/${latestVersion}/deno_dist/tools/typeSafety/assert.ts`
        );
    }

    console.log("PASS");
})();
