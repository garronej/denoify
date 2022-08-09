import { ModuleAddress } from "../../../lib/types/ModuleAddress";
import { getValidImportUrlFactory } from "../../../lib/resolveNodeModuleToDenoModule";
import { getLatestTag } from "../../../tools/githubTags";

import { assert } from "tsafe";

(async () => {
    const moduleAddress: ModuleAddress.GitHubRepo = {
        "type": "GITHUB REPO",
        "userOrOrg": "garronej",
        "repositoryName": "ts-md5",
        "branch": undefined
    } as const;

    const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
        "moduleAddress": moduleAddress,
        "desc": "MATCH VERSION INSTALLED IN NODE_MODULE",
        "version": "99.99.99"
    });

    assert(getValidImportUrlFactoryResult.couldConnect === true);

    const { versionFallbackWarning, getValidImportUrl } = getValidImportUrlFactoryResult;

    assert(typeof versionFallbackWarning === "string");

    const latestTag = await getLatestTag({
        "owner": moduleAddress.userOrOrg,
        "repo": moduleAddress.repositoryName
    });

    assert(latestTag !== undefined);

    assert(
        (await getValidImportUrl({ "target": "DEFAULT EXPORT" })) ===
            `https://raw.githubusercontent.com/garronej/ts-md5/${latestTag}/deno_dist/mod.ts`
    );

    assert(
        (await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "dist/parallel_hasher" })) ===
            `https://raw.githubusercontent.com/garronej/ts-md5/${latestTag}/deno_dist/parallel_hasher.ts`
    );

    for (const specificImportPath of ["./dist/parallel_hasher", "dist/parallel_hasher", "./parallel_hasher", "parallel_hasher"]) {
        assert(
            (await getValidImportUrl({ "target": "SPECIFIC FILE", specificImportPath })) ===
                `https://raw.githubusercontent.com/garronej/ts-md5/${latestTag}/deno_dist/parallel_hasher.ts`
        );
    }

    console.log("PASS");
})();
