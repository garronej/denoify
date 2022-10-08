import { ModuleAddress } from "../../../lib/types/ModuleAddress";
import { getValidImportUrlFactory } from "../../../lib/resolveNodeModuleToDenoModule";
import { getThirdPartyDenoModuleInfos } from "../../../lib/getThirdPartyDenoModuleInfos";
import { parseGetValidImportUrlResultAsCouldConnect } from "./shared";

const test2 = () =>
    describe("test 2", () => {
        it("should fallback to available latest version and get the content of valid url file path for evt when the latest version specified is not available", async () => {
            const moduleAddress: ModuleAddress.GitHubRepo = {
                "type": "GITHUB REPO",
                "userOrOrg": "garronej",
                "repositoryName": "evt",
                "branch": undefined
            } as const;

            const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
                "moduleAddress": moduleAddress,
                "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
                "version": "99.99.99"
            });

            expect(getValidImportUrlFactoryResult.couldConnect).toBe(true);

            const { versionFallbackWarning, getValidImportUrl } = parseGetValidImportUrlResultAsCouldConnect(getValidImportUrlFactoryResult);

            expect(typeof versionFallbackWarning).toBe("string");

            const { latestVersion } = (await getThirdPartyDenoModuleInfos({ "denoModuleName": "evt" }))!;

            expect(await getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe(`https://deno.land/x/evt@${latestVersion}/mod.ts`);

            expect(await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "hooks/useEvt" })).toBe(
                `https://deno.land/x/evt@${latestVersion}/hooks/useEvt.ts`
            );

            expect(await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "hooks" })).toBe(
                `https://deno.land/x/evt@${latestVersion}/hooks/index.ts`
            );
        });

        it("should get the latest version and its content of valid url file path for evt when the latest version specified is available", async () => {
            const expectedScheme: ModuleAddress.GitHubRepo = {
                "type": "GITHUB REPO",
                "userOrOrg": "garronej",
                "repositoryName": "evt",
                "branch": undefined
            } as const;

            {
                const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
                    "moduleAddress": expectedScheme,
                    "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
                    "version": "2.4.1"
                });

                expect(getValidImportUrlFactoryResult.couldConnect).toBe(true);

                const { versionFallbackWarning, getValidImportUrl } = parseGetValidImportUrlResultAsCouldConnect(getValidImportUrlFactoryResult);

                expect(versionFallbackWarning).toBeUndefined();

                expect(await getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe("https://deno.land/x/evt@v2.4.1/mod.ts");
            }

            console.log("PASS");
        });
    });
export default test2;
