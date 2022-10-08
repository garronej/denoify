import { ModuleAddress } from "../../../lib/types/ModuleAddress";
import { getValidImportUrlFactory } from "../../../lib/resolveNodeModuleToDenoModule";
import { parseGetValidImportUrlResultAsCouldConnect } from "./shared";

const test4 = () =>
    describe("test 4", () => {
        it("should get the valid content for my_dummy_npm_and_deno_module from github repo", async () => {
            const moduleAddress: ModuleAddress.GitHubRepo = {
                "type": "GITHUB REPO",
                "userOrOrg": "garronej",
                "repositoryName": "my_dummy_npm_and_deno_module",
                "branch": undefined
            };

            const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
                moduleAddress,
                "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
                "version": "0.4.3"
            });

            expect(getValidImportUrlFactoryResult.couldConnect).toBe(true);

            const { versionFallbackWarning, getValidImportUrl } = parseGetValidImportUrlResultAsCouldConnect(getValidImportUrlFactoryResult);

            expect(versionFallbackWarning).toBeUndefined();
            expect(await getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe("https://deno.land/x/my_dummy_npm_and_deno_module@v0.4.3/mod.ts");
            expect(await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "dist/lib/Cat" })).toBe(
                "https://deno.land/x/my_dummy_npm_and_deno_module@v0.4.3/lib/Cat.ts"
            );
        });

        it("should get the valid content for my_dummy_npm_and_deno_module from github raw url", async () => {
            const moduleAddress: ModuleAddress.GitHubRawUrl = {
                "type": "GITHUB-RAW URL",
                "baseUrlWithoutBranch": "https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module",
                "branch": "v0.2.0",
                "pathToIndex": "deno_dist/mod.ts"
            };

            expect(
                ModuleAddress.parse("https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/v0.2.0/deno_dist/mod.ts")
            ).toStrictEqual(moduleAddress);

            expect(ModuleAddress.parse("https://raw.github.com/garronej/my_dummy_npm_and_deno_module/v0.2.0/deno_dist/mod.ts")).toStrictEqual(
                moduleAddress
            );

            const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
                moduleAddress,
                "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
                "version": "v0.2.9"
            });

            expect(getValidImportUrlFactoryResult.couldConnect).toBe(true);

            const { versionFallbackWarning, getValidImportUrl } = parseGetValidImportUrlResultAsCouldConnect(getValidImportUrlFactoryResult);

            expect(versionFallbackWarning).toBeUndefined();
            expect(await getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe(
                "https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/v0.2.9/deno_dist/mod.ts"
            );
        });
    });

export default test4;