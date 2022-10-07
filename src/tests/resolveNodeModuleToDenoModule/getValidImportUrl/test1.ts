import { ModuleAddress } from "../../../lib/types/ModuleAddress";
import { same } from "evt/tools/inDepth";
import { getValidImportUrlFactory } from "../../../lib/resolveNodeModuleToDenoModule";
import { getLatestTag } from "../../../tools/githubTags";

const test1 = () =>
    describe("test 1", () => {
        const moduleAddress: ModuleAddress.GitHubRepo = {
            "type": "GITHUB REPO",
            "userOrOrg": "garronej",
            "repositoryName": "ts-md5",
            "branch": undefined
        };
        it("should get valid url for ts-md5", () => {
            const prefixes = ["", "github:"];
            const results = prefixes.map(
                prefix =>
                    same(ModuleAddress.parse(`${prefix}garronej/ts-md5`), moduleAddress) &&
                    same(ModuleAddress.parse(`${prefix}garronej/ts-md5#1.2.7`), {
                        ...moduleAddress,
                        "branch": "1.2.7"
                    })
            );
            expect(results).toHaveLength(prefixes.length);
            expect(results.every(result => result)).toBe(true);
        });
        it("should get content of valid url file path for ts-md5", async () => {
            const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
                "moduleAddress": moduleAddress,
                "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
                "version": "99.99.99"
            });

            expect(getValidImportUrlFactoryResult.couldConnect).toBe(true);

            const { versionFallbackWarning, getValidImportUrl } = (() => {
                switch (getValidImportUrlFactoryResult.couldConnect) {
                    case false:
                        throw new Error("couldConnect of getValidImportUrlFactoryResult cannot be false");
                    case true:
                        return getValidImportUrlFactoryResult;
                }
            })();

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

            const specificImportPaths = ["./dist/parallel_hasher", "dist/parallel_hasher", "./parallel_hasher", "parallel_hasher"];
            const results = specificImportPaths.map(
                async specificImportPath =>
                    (await getValidImportUrl({ "target": "SPECIFIC FILE", specificImportPath })) ===
                    `https://raw.githubusercontent.com/garronej/ts-md5/${latestTag}/deno_dist/parallel_hasher.ts`
            );
            expect(results).toHaveLength(4);
            expect(results.every(result => result)).toBe(true);
        });
    });

export default test1;
