import { ModuleAddress } from "../../../lib/types/ModuleAddress";
import { getCurrentStdVersion } from "../../../lib/getCurrentStdVersion";
import { getValidImportUrlFactory } from "../../../lib/resolveNodeModuleToDenoModule";
import { parseGetValidImportUrlResultAsCouldConnect } from "./shared";

const test5 = () =>
    describe("test 5 (deno std)", () => {
        it("should get the valid url file path for deno std", async () => {
            const fileModuleAddress: ModuleAddress.DenoLandUrl = {
                "type": "DENO.LAND URL",
                "isStd": true,
                "baseUrlWithoutBranch": "https://deno.land/std",
                "branch": undefined,
                "pathToIndex": "node/fs.ts"
            };

            expect(ModuleAddress.parse("https://deno.land/std/node/fs.ts")).toStrictEqual(fileModuleAddress);
            expect(ModuleAddress.parse("https://deno.land/std@0.153.0/node/fs.ts")).toStrictEqual({ ...fileModuleAddress, "branch": "0.153.0" });

            const fileGetValidImportUrlFactoryResult = await getValidImportUrlFactory({
                moduleAddress: fileModuleAddress,
                "desc": "NOT LISTED AS A DEPENDENCY (PROBABLY NODE BUILTIN)"
            });

            expect(fileGetValidImportUrlFactoryResult.couldConnect).toBe(true);

            const parsedFileGetValidImportUrlFactoryResult = parseGetValidImportUrlResultAsCouldConnect(fileGetValidImportUrlFactoryResult);

            expect(parsedFileGetValidImportUrlFactoryResult.versionFallbackWarning).toBeUndefined();
            expect(await parsedFileGetValidImportUrlFactoryResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe(
                `https://deno.land/std@${await getCurrentStdVersion()}/node/fs.ts`
            );
            expect(
                await parsedFileGetValidImportUrlFactoryResult.getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "promises" })
            ).toBe(`https://deno.land/std@${await getCurrentStdVersion()}/node/fs/promises.ts`);

            const eventModuleAddress: ModuleAddress.DenoLandUrl = {
                "type": "DENO.LAND URL",
                "isStd": true,
                "baseUrlWithoutBranch": "https://deno.land/std",
                "branch": undefined,
                "pathToIndex": "node/events.ts"
            };

            expect(ModuleAddress.parse("https://deno.land/std/node/events.ts")).toStrictEqual(eventModuleAddress);
            expect(ModuleAddress.parse("https://deno.land/std@0.153.0/node/events.ts")).toStrictEqual({ ...eventModuleAddress, "branch": "0.153.0" });

            const eventGetValidImportUrlFactoryResult = await getValidImportUrlFactory({
                moduleAddress: eventModuleAddress,
                "desc": "NOT LISTED AS A DEPENDENCY (PROBABLY NODE BUILTIN)"
            });

            assert(eventGetValidImportUrlFactoryResult.couldConnect === true);

            const parsedEventGetValidImportUrlFactoryResult = parseGetValidImportUrlResultAsCouldConnect(eventGetValidImportUrlFactoryResult);

            expect(parsedEventGetValidImportUrlFactoryResult.versionFallbackWarning).toBeUndefined();
            expect(await parsedEventGetValidImportUrlFactoryResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe(
                `https://deno.land/std@${await getCurrentStdVersion()}/node/events.ts`
            );
        });
    });

export default test5;
