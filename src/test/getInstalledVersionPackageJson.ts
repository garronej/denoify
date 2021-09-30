
import { getInstalledVersionPackageJsonFactory } from "../lib/getInstalledVersionPackageJson";
import * as path from "path";
import { assert } from "tsafe";

(async () => {

    const { getInstalledVersionPackageJson } = getInstalledVersionPackageJsonFactory({
        "projectPath": path.join(__dirname, "..", "..", "res", "test_resolve_1"),
    });

    const { version } = await getInstalledVersionPackageJson({ "nodeModuleName": "js-yaml" });

    assert(version === "3.13.1");

    console.log("PASS");

})();


