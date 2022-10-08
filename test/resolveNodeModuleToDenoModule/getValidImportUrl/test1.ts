import { same } from "evt/tools/inDepth";
import { describe, it, expect } from "vitest";
import { getValidImportUrlFactory } from "../../../src/lib/resolveNodeModuleToDenoModule";
import { ModuleAddress } from "../../../src/lib/types/ModuleAddress";
import { getLatestTag } from "../../../src/tools/githubTags";
import { parseGetValidImportUrlResultAsCouldConnect } from "./shared";

const test1 = () =>
    describe("test 1", () => {
        it("should get valid url for ts-md5", () => {
            const moduleAddress: ModuleAddress.GitHubRepo = {
                "type": "GITHUB REPO",
                "userOrOrg": "garronej",
                "repositoryName": "ts-md5",
                "branch": undefined
            };

            const canGetValidDeneCompatibleUrl = ["", "github:"].every(
                prefix =>
                    same(ModuleAddress.parse(`${prefix}garronej/ts-md5`), moduleAddress) &&
                    same(ModuleAddress.parse(`${prefix}garronej/ts-md5#1.2.7`), {
                        ...moduleAddress,
                        "branch": "1.2.7"
                    })
            );
            expect(canGetValidDeneCompatibleUrl).toBe(true);
        });

        it("should fallback to available latest version and get the valid url file path for ts-md5 when the latest version specified is not available", async () => {
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

            expect(getValidImportUrlFactoryResult.couldConnect).toBe(true);

            const { versionFallbackWarning, getValidImportUrl } = parseGetValidImportUrlResultAsCouldConnect(getValidImportUrlFactoryResult);

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

            const canGetValidDeneCompatibleUrl = ["./dist/parallel_hasher", "dist/parallel_hasher", "./parallel_hasher", "parallel_hasher"].every(
                async specificImportPath =>
                    (await getValidImportUrl({ "target": "SPECIFIC FILE", specificImportPath })) ===
                    `https://raw.githubusercontent.com/garronej/ts-md5/${latestTag}/deno_dist/parallel_hasher.ts`
            );
            expect(canGetValidDeneCompatibleUrl).toBe(true);
        });

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

            expect(getValidImportUrlFactoryResult.couldConnect).toBe(true);

            const { versionFallbackWarning, getValidImportUrl } = parseGetValidImportUrlResultAsCouldConnect(getValidImportUrlFactoryResult);

            expect(versionFallbackWarning).toBeUndefined();

            expect(await getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe(
                "https://raw.githubusercontent.com/garronej/ts-md5/v1.2.7/deno_dist/mod.ts"
            );

            expect(await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "dist/parallel_hasher" })).toBe(
                "https://raw.githubusercontent.com/garronej/ts-md5/v1.2.7/deno_dist/parallel_hasher.ts"
            );
        });
    });

export default test1;
