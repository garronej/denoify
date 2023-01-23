import * as path from "path";
import { describe, it, expect } from "vitest";
import { getInstalledVersionPackageJsonFactory } from "../src/lib/getInstalledVersionPackageJson";

describe("get the version of npm package installed from package.json", () => {
    it("should return the version of package installed", async () => {
        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJsonFactory({
            "projectPath": path.join(__dirname, "..", "res", "test_resolve_1")
        });

        expect(await getInstalledVersionPackageJson({ "nodeModuleName": "js-yaml" })).toStrictEqual({
            version: "3.13.1"
        });
    });
});
