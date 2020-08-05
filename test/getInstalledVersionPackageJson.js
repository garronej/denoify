"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getInstalledVersionPackageJson_1 = require("../lib/getInstalledVersionPackageJson");
const path = require("path");
const typeSafety_1 = require("evt/tools/typeSafety");
(async () => {
    const { getInstalledVersionPackageJson } = getInstalledVersionPackageJson_1.getInstalledVersionPackageJsonFactory({
        "projectPath": path.join(__dirname, "..", "..", "res", "test_resolve_1"),
    });
    const { version } = await getInstalledVersionPackageJson({ "nodeModuleName": "js-yaml" });
    typeSafety_1.assert(version === "3.13.1");
    console.log("PASS");
})();
//# sourceMappingURL=getInstalledVersionPackageJson.js.map