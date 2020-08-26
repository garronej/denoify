"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resolveNodeModuleToDenoModule_1 = require("../../lib/resolveNodeModuleToDenoModule");
const path = require("path");
const typeSafety_1 = require("evt/tools/typeSafety");
const getInstalledVersionPackageJson_1 = require("../../lib/getInstalledVersionPackageJson");
const fs = require("fs");
const getThirdPartyDenoModuleInfos_1 = require("../../lib/getThirdPartyDenoModuleInfos");
(async () => {
    {
        let std_out = "";
        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJson_1.getInstalledVersionPackageJsonFactory({
            "projectPath": path.join(__dirname, "..", "..", "..", "res", "test_resolve_1"),
        });
        const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModule_1.resolveNodeModuleToDenoModuleFactory({
            getInstalledVersionPackageJson,
            "dependencies": {
                "js-yaml": "~3.13.0"
            },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args) => std_out += args.join(" ")
        });
        const nodeToDenoModuleResolutionResult = await resolveNodeModuleToDenoModule({ "nodeModuleName": "js-yaml" });
        typeSafety_1.assert(nodeToDenoModuleResolutionResult.result === "SUCCESS");
        typeSafety_1.assert(await nodeToDenoModuleResolutionResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
                "https://deno.land/x/js_yaml_port@3.13.1/js-yaml.js");
        typeSafety_1.assert(std_out === "");
    }
    {
        let std_out = "";
        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJson_1.getInstalledVersionPackageJsonFactory({
            "projectPath": path.join(__dirname, "..", "..", "..", "res", "test_resolve_2"),
        }); //NOTE: The version in package.json does not exist as a repo TAG.
        const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModule_1.resolveNodeModuleToDenoModuleFactory({
            getInstalledVersionPackageJson,
            "dependencies": {
                "js-yaml": "...irrelevant..."
            },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args) => std_out += args.join(" ")
        });
        const nodeToDenoModuleResolutionResult = await resolveNodeModuleToDenoModule({ "nodeModuleName": "js-yaml" });
        typeSafety_1.assert(nodeToDenoModuleResolutionResult.result === "SUCCESS");
        typeSafety_1.assert(await nodeToDenoModuleResolutionResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
                `https://deno.land/x/js_yaml_port@${(await getThirdPartyDenoModuleInfos_1.getThirdPartyDenoModuleInfos({ "denoModuleName": "js_yaml_port" })).latestVersion}/js-yaml.js`);
        const expected_std_out = `Can't lookup version 3.13.0 for module {"type":"DENO.LAND URL","isStd":false,"baseUrlWithoutBranch":"https://deno.land/x/js_yaml_port","pathToIndex":"js-yaml.js"}, falling back to 3.14.0`;
        typeSafety_1.assert(std_out === expected_std_out);
        typeSafety_1.assert(std_out.length !== 0);
    }
    {
        let std_out = "";
        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJson_1.getInstalledVersionPackageJsonFactory({
            "projectPath": path.join(__dirname, "..", "..", "..", "res", "test_resolve_3"),
        });
        const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModule_1.resolveNodeModuleToDenoModuleFactory({
            getInstalledVersionPackageJson,
            "dependencies": { "ts-md5": "1.2.7" },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args) => std_out += args.join(" ")
        });
        const nodeToDenoModuleResolutionResult = await resolveNodeModuleToDenoModule({ "nodeModuleName": "ts-md5" });
        typeSafety_1.assert(nodeToDenoModuleResolutionResult.result === "SUCCESS");
        typeSafety_1.assert(await nodeToDenoModuleResolutionResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
                "https://raw.githubusercontent.com/garronej/ts-md5/v1.2.7/deno_dist/mod.ts");
        typeSafety_1.assert(std_out === "");
    }
    //TODO: Uncomment
    /*
    {

        let std_out = "";

        const projectPath = path.join(__dirname, "..", "..", "..", "res", "test_resolve_4");

        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJsonFactory({
            projectPath
        });

        const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModuleFactory({
            getInstalledVersionPackageJson,
            "dependencies": { "my-dummy-npm-and-deno-module": "0.0.0" },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args: any[]) => std_out += args.join(" ")
        });

        const nodeToDenoModuleResolutionResult = await resolveNodeModuleToDenoModule({ "nodeModuleName": "my-dummy-npm-and-deno-module" });

        assert(nodeToDenoModuleResolutionResult.result === "SUCCESS");

        assert(
            await nodeToDenoModuleResolutionResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
            `https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/v${
            JSON.parse(
                fs.readFileSync(
                    path.join(projectPath, "package.json")
                ).toString("utf8")
            )["version"]
            }/mod.ts`
        );


        assert(std_out === "");

    }
    */
    {
        let std_out = "";
        const projectPath = path.join(__dirname, "..", "..", "..", "res", "test_resolve_5");
        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJson_1.getInstalledVersionPackageJsonFactory({
            projectPath
        });
        const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModule_1.resolveNodeModuleToDenoModuleFactory({
            getInstalledVersionPackageJson,
            //NOTE: We put 0.0.0 to show that it is not took into account only after the installed version.
            "dependencies": { "ts-md5": "garronej/ts-md5#0.0.0" },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args) => std_out += args.join(" ")
        });
        const nodeToDenoModuleResolutionResult = await resolveNodeModuleToDenoModule({ "nodeModuleName": "ts-md5" });
        typeSafety_1.assert(nodeToDenoModuleResolutionResult.result === "SUCCESS");
        typeSafety_1.assert(await nodeToDenoModuleResolutionResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
                `https://raw.githubusercontent.com/garronej/ts-md5/v${JSON.parse(fs.readFileSync(path.join(projectPath, "node_modules", "ts-md5", "package.json")).toString("utf8"))["version"]}/deno_dist/mod.ts`);
        typeSafety_1.assert(std_out === "");
    }
    //TODO: Uncomment
    /*
    {

        let std_out = "";

        const projectPath = path.join(__dirname, "..", "..", "..", "res", "test_resolve_5");

        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJsonFactory({
            projectPath
        });

        const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModuleFactory({
            getInstalledVersionPackageJson,
            "dependencies": {
                "minimal-polyfills": "...irrelevant..."
            },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args: any[]) => std_out += args.join(" ")
        });


        const nodeToDenoModuleResolutionResult = await resolveNodeModuleToDenoModule({ "nodeModuleName": "minimal-polyfills" });

        assert(nodeToDenoModuleResolutionResult.result === "SUCCESS");

        assert(
            await nodeToDenoModuleResolutionResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
            `https://raw.githubusercontent.com/garronej/minimal_polyfills/v${
            JSON.parse(
                fs.readFileSync(
                    path.join(projectPath,"node_modules", "minimal-polyfills", "package.json")
                ).toString("utf8")
            )["version"]
            }/deno_dist/mod.ts`
        );


        assert(std_out === "");

    }
    */
    console.log("PASS");
})();
//# sourceMappingURL=resolveNodeModuleToDenoModule.js.map