import { describe, it, expect } from "vitest";
import { getValidImportUrlFactory } from "../../../src/lib/resolveNodeModuleToDenoModule/getValidImportUrlFactory";
import { ModuleAddress } from "../../../src/lib/types/ModuleAddress";
import { getLatestTag } from "../../../src/tools/githubTags";
import { assert } from "tsafe/assert";

describe("test 1", () => {
    it.each(["", "github: "])("should get valid url for ts-md5 with prefix: '%s'", prefix => {
        const moduleAddress: ModuleAddress.GitHubRepo = {
            "type": "GITHUB REPO",
            "userOrOrg": "garronej",
            "repositoryName": "ts-md5",
            "branch": undefined
        };

        expect(ModuleAddress.parse(`${prefix}garronej/ts-md5`)).toStrictEqual(moduleAddress);
        expect(ModuleAddress.parse(`${prefix}garronej/ts-md5#1.2.7`)).toStrictEqual({
            ...moduleAddress,
            "branch": "1.2.7"
        });
    });

    it.each(["./dist/parallel_hasher", "dist/parallel_hasher", "./parallel_hasher", "parallel_hasher"])(
        "should fallback to available latest version and get the valid url file path of '%s' for ts-md5 when the latest version specified is not available",
        async specificImportPath => {
            const moduleAddress: ModuleAddress.GitHubRepo = {
                "type": "GITHUB REPO",
                "userOrOrg": "garronej",
                "repositoryName": "ts-md5",
                "branch": undefined
            };

            const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
                "moduleAddress": moduleAddress,
                "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
                "version": "99.99.99"
            });

            assert(getValidImportUrlFactoryResult.couldConnect);

            const { versionFallbackWarning, getValidImportUrl } = getValidImportUrlFactoryResult;

            expect(typeof versionFallbackWarning).toBe("string");

            const latestTag = await getLatestTag({
                "owner": moduleAddress.userOrOrg,
                "repo": moduleAddress.repositoryName
            });

            expect(typeof latestTag).toBe("string");

            expect(await getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe(
                `https://raw.githubusercontent.com/garronej/ts-md5/${latestTag}/deno_dist/mod.ts`
            );
            expect(await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "dist/parallel_hasher" })).toBe(
                `https://raw.githubusercontent.com/garronej/ts-md5/${latestTag}/deno_dist/parallel_hasher.ts`
            );

            expect(await getValidImportUrl({ "target": "SPECIFIC FILE", specificImportPath })).toBe(
                `https://raw.githubusercontent.com/garronej/ts-md5/${latestTag}/deno_dist/parallel_hasher.ts`
            );
        }
    );

    it("should get the latest version and its valid url file path for ts-md5 when the latest version specified is available", async () => {
        const moduleAddress: ModuleAddress.GitHubRepo = {
            "type": "GITHUB REPO",
            "userOrOrg": "garronej",
            "repositoryName": "ts-md5",
            "branch": undefined
        };

        const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
            "moduleAddress": moduleAddress,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
            "version": "1.2.7"
        });

        assert(getValidImportUrlFactoryResult.couldConnect);

        const { versionFallbackWarning, getValidImportUrl } = getValidImportUrlFactoryResult;

        expect(versionFallbackWarning).toBeUndefined();

        expect(await getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe(
            "https://raw.githubusercontent.com/garronej/ts-md5/v1.2.7/deno_dist/mod.ts"
        );

        expect(await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "dist/parallel_hasher" })).toBe(
            "https://raw.githubusercontent.com/garronej/ts-md5/v1.2.7/deno_dist/parallel_hasher.ts"
        );
    });
});
