import { describe, it, expect } from "vitest";
import { getCurrentStdVersion } from "../../../src/lib/getCurrentStdVersion";
import { getValidImportUrlFactory } from "../../../src/lib/resolveNodeModuleToDenoModule";
import { ModuleAddress } from "../../../src/lib/types/ModuleAddress";
import { parseGetValidImportUrlResultAsCouldConnect } from "./shared";

describe("test 5 (deno std)", () => {
    it("should get the valid url for deno std fs", async () => {
        const moduleAddress: ModuleAddress.DenoLandUrl = {
            "type": "DENO.LAND URL",
            "isStd": true,
            "baseUrlWithoutBranch": "https://deno.land/std",
            "branch": undefined,
            "pathToIndex": "node/fs.ts"
        };

        expect(ModuleAddress.parse("https://deno.land/std/node/fs.ts")).toStrictEqual(moduleAddress);
        expect(ModuleAddress.parse("https://deno.land/std@0.153.0/node/fs.ts")).toStrictEqual({ ...moduleAddress, "branch": "0.153.0" });

        const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
            moduleAddress,
            "desc": "NOT LISTED AS A DEPENDENCY (PROBABLY NODE BUILTIN)"
        });

        expect(getValidImportUrlFactoryResult.couldConnect).toBe(true);

        const { versionFallbackWarning, getValidImportUrl } = parseGetValidImportUrlResultAsCouldConnect(getValidImportUrlFactoryResult);

        expect(versionFallbackWarning).toBeUndefined();
        expect(await getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe(`https://deno.land/std@${await getCurrentStdVersion()}/node/fs.ts`);
        expect(await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "promises" })).toBe(
            `https://deno.land/std@${await getCurrentStdVersion()}/node/fs/promises.ts`
        );
    });

    it("should get the valid url for deno std event", async () => {
        const moduleAddress: ModuleAddress.DenoLandUrl = {
            "type": "DENO.LAND URL",
            "isStd": true,
            "baseUrlWithoutBranch": "https://deno.land/std",
            "branch": undefined,
            "pathToIndex": "node/events.ts"
        };

        expect(ModuleAddress.parse("https://deno.land/std/node/events.ts")).toStrictEqual(moduleAddress);
        expect(ModuleAddress.parse("https://deno.land/std@0.153.0/node/events.ts")).toStrictEqual({ ...moduleAddress, "branch": "0.153.0" });

        const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
            moduleAddress,
            "desc": "NOT LISTED AS A DEPENDENCY (PROBABLY NODE BUILTIN)"
        });

        expect(getValidImportUrlFactoryResult.couldConnect).toBe(true);

        const { versionFallbackWarning, getValidImportUrl } = parseGetValidImportUrlResultAsCouldConnect(getValidImportUrlFactoryResult);

        expect(versionFallbackWarning).toBeUndefined();
        expect(await getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe(`https://deno.land/std@${await getCurrentStdVersion()}/node/events.ts`);
    });

    //When this is installed: https://www.npmjs.com/package/buffer
    //We should still resolve the std without trying to match the version
    it("should get the valid url file path for deno std buffer", async () => {
        const moduleAddress: ModuleAddress.DenoLandUrl = {
            "type": "DENO.LAND URL",
            "isStd": true,
            "baseUrlWithoutBranch": "https://deno.land/std",
            "branch": undefined,
            "pathToIndex": "node/buffer.ts"
        };

        expect(ModuleAddress.parse("https://deno.land/std/node/buffer.ts")).toStrictEqual(moduleAddress);
        expect(ModuleAddress.parse("https://deno.land/std@master/node/buffer.ts")).toStrictEqual({ ...moduleAddress, "branch": "master" });

        const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
            moduleAddress,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
            "version": "0.55.0"
            //https://deno.land/std/node/buffer.ts we voluntarily take a version that exist
            //on deno.land ( event if it is not a valid npm buffer version).
            //to ensure that it does not resolve.
        });

        expect(getValidImportUrlFactoryResult.couldConnect).toBe(true);

        const parsedBufferGetValidImportUrlFactoryResult = parseGetValidImportUrlResultAsCouldConnect(getValidImportUrlFactoryResult);

        expect(parsedBufferGetValidImportUrlFactoryResult.versionFallbackWarning).toBeUndefined();
        expect(await parsedBufferGetValidImportUrlFactoryResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe(
            `https://deno.land/std@${await getCurrentStdVersion()}/node/buffer.ts`
        );
    });
});
