import { describe, it, expect } from "vitest";
import { getValidImportUrlFactory } from "../../../src/lib/resolveNodeModuleToDenoModule";
import { ModuleAddress } from "../../../src/lib/types/ModuleAddress";
import { getLatestTag } from "../../../src/tools/githubTags";
import { parseGetValidImportUrlResultAsCouldConnect } from "./shared";

describe("test 3 (deno non std)", () => {
    it("should fallback to available latest version and get the valid url file path for js-yaml when the latest version specified is not available", async () => {
        const moduleAddress: ModuleAddress.DenoLandUrl = {
            "type": "DENO.LAND URL",
            "isStd": false,
            "pathToIndex": "js-yaml.js",
            "baseUrlWithoutBranch": "https://deno.land/x/js_yaml_port",
            "branch": undefined
        };

        expect(ModuleAddress.parse("https://deno.land/x/js_yaml_port/js-yaml.js")).toStrictEqual(moduleAddress);

        const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
            moduleAddress,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
            "version": "99.99.99"
        });

        expect(getValidImportUrlFactoryResult.couldConnect).toBe(true);

        const { versionFallbackWarning, getValidImportUrl } = parseGetValidImportUrlResultAsCouldConnect(getValidImportUrlFactoryResult);

        expect(typeof versionFallbackWarning).toBe("string");

        const latestTag = await getLatestTag({ "owner": "KSXGitHub", "repo": "simple-js-yaml-port-for-deno" });

        expect(await getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe(`https://deno.land/x/js_yaml_port@${latestTag}/js-yaml.js`);
    });

    it("should get the latest version and its valid url file path for js-yaml when the latest version specified is available", async () => {
        const moduleAddress: ModuleAddress.DenoLandUrl = {
            "type": "DENO.LAND URL",
            "isStd": false,
            "pathToIndex": "js-yaml.js",
            "baseUrlWithoutBranch": "https://deno.land/x/js_yaml_port",
            "branch": undefined
        };

        expect(ModuleAddress.parse("https://deno.land/x/js_yaml_port/js-yaml.js")).toStrictEqual(moduleAddress);

        const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
            moduleAddress,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
            "version": "3.14.0"
        });

        expect(getValidImportUrlFactoryResult.couldConnect).toBe(true);

        const { versionFallbackWarning, getValidImportUrl } = parseGetValidImportUrlResultAsCouldConnect(getValidImportUrlFactoryResult);

        expect(versionFallbackWarning).toBeUndefined();
        expect(await getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe("https://deno.land/x/js_yaml_port@3.14.0/js-yaml.js");
    });
});
