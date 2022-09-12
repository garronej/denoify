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

        assert((await getValidImportUrl({ "target": "DEFAULT EXPORT" })) === `https://deno.land/x/evt@${latestVersion}/mod.ts`);

        assert(
            (await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "hooks/useEvt" })) ===
                `https://deno.land/x/evt@${latestVersion}/hooks/useEvt.ts`
        );

        assert(
            (await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "hooks" })) ===
                `https://deno.land/x/evt@${latestVersion}/hooks/index.ts`
        );
    }

    console.log("PASS");
})();
