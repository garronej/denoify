import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { resolveNodeModuleToDenoModuleFactory } from "../../src/lib/resolveNodeModuleToDenoModule";
import { getInstalledVersionPackageJsonFactory } from "../../src/lib/getInstalledVersionPackageJson";
import { getThirdPartyDenoModuleInfos } from "../../src/lib/getThirdPartyDenoModuleInfos";

type ResolveNodeModuleToDenoModule = Awaited<ReturnType<ReturnType<typeof resolveNodeModuleToDenoModuleFactory>["resolveNodeModuleToDenoModule"]>>;

const parseNodeToDenoModuleAsSuccess = (resolveNodeModuleToDenoModule: ResolveNodeModuleToDenoModule) => {
    switch (resolveNodeModuleToDenoModule.result) {
        case "UNKNOWN BUILTIN":
            throw new Error("result of resolveNodeModuleToDenoModule cannot be UNKNOWN BUILTIN");
        case "SUCCESS":
            return resolveNodeModuleToDenoModule;
    }
};

describe("resolve node module to deno-module", () => {
    it("should resolve js-yaml package to deno module", async () => {
        let std_out = "";

        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJsonFactory({
            "projectPath": path.join(__dirname, "..", "res", "test_resolve_1")
        });

        const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModuleFactory({
            getInstalledVersionPackageJson,
            "dependencies": {
                "js-yaml": "~3.13.0"
            },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args: any[]) => (std_out += args.join(" "))
        });

        const nodeToDenoModuleResolutionResult = await resolveNodeModuleToDenoModule({ "nodeModuleName": "js-yaml" });

        expect(nodeToDenoModuleResolutionResult.result).toBe("SUCCESS");

        const { getValidImportUrl } = parseNodeToDenoModuleAsSuccess(nodeToDenoModuleResolutionResult);

        expect(await getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe("https://deno.land/x/js_yaml_port@3.13.1/js-yaml.js");
        expect(std_out).toBe("");
    });

    it("should fail to resolve invalid js-yaml package to deno module", async () => {
        let std_out = "";

        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJsonFactory({
            "projectPath": path.join(__dirname, "..", "res", "test_resolve_2")
        }); //NOTE: The version in package.json does not exist as a repo TAG.

        const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModuleFactory({
            getInstalledVersionPackageJson,
            "dependencies": {
                "js-yaml": "...irrelevant..."
            },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args: any[]) => (std_out += args.join(" "))
        });

        const nodeToDenoModuleResolutionResult = await resolveNodeModuleToDenoModule({ "nodeModuleName": "js-yaml" });

        expect(nodeToDenoModuleResolutionResult.result).toBe("SUCCESS");

        const { getValidImportUrl } = parseNodeToDenoModuleAsSuccess(nodeToDenoModuleResolutionResult);

        expect(await getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe(
            `https://deno.land/x/js_yaml_port@${(await getThirdPartyDenoModuleInfos({ "denoModuleName": "js_yaml_port" }))!.latestVersion}/js-yaml.js`
        );

        expect(
            std_out ===
                `Can't lookup version 3.13.0 for module {"type":"DENO.LAND URL","isStd":false,"baseUrlWithoutBranch":"https://deno.land/x/js_yaml_port","pathToIndex":"js-yaml.js"}, falling back to 3.14.0`
        ).toBe(true);
    });

    it("should resolve valid ts-md5 package to deno module", async () => {
        let std_out = "";

        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJsonFactory({
            "projectPath": path.join(__dirname, "..", "res", "test_resolve_3")
        });

        const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModuleFactory({
            getInstalledVersionPackageJson,
            "dependencies": { "ts-md5": "1.2.7" },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args: any[]) => (std_out += args.join(" "))
        });

        const nodeToDenoModuleResolutionResult = await resolveNodeModuleToDenoModule({ "nodeModuleName": "ts-md5" });

        expect(nodeToDenoModuleResolutionResult.result).toBe("SUCCESS");

        const { getValidImportUrl } = parseNodeToDenoModuleAsSuccess(nodeToDenoModuleResolutionResult);

        expect(await getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe(
            "https://raw.githubusercontent.com/garronej/ts-md5/v1.2.7/deno_dist/mod.ts"
        );

        expect(std_out === "").toBe(true);
    });

    it("should resolve valid ts-md5 package to deno module", async () => {
        let std_out = "";

        const projectPath = path.join(__dirname, "..", "res", "test_resolve_5");

        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJsonFactory({
            projectPath
        });

        const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModuleFactory({
            getInstalledVersionPackageJson,
            //NOTE: We put 0.0.0 to show that it is not took into account only after the installed version.
            "dependencies": { "ts-md5": "garronej/ts-md5#0.0.0" },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args: any[]) => (std_out += args.join(" "))
        });

        const nodeToDenoModuleResolutionResult = await resolveNodeModuleToDenoModule({ "nodeModuleName": "ts-md5" });

        expect(nodeToDenoModuleResolutionResult.result).toBe("SUCCESS");

        const { getValidImportUrl } = parseNodeToDenoModuleAsSuccess(nodeToDenoModuleResolutionResult);

        expect(await getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe(
            `https://raw.githubusercontent.com/garronej/ts-md5/v${
                JSON.parse(fs.readFileSync(path.join(projectPath, "node_modules", "ts-md5", "package.json")).toString("utf8"))["version"]
            }/deno_dist/mod.ts`
        );

        expect(std_out === "").toBe(true);
    });
});
