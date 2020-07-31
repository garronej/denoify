
import { resolveNodeModuleToDenoModuleFactory } from "../../lib/resolveNodeModuleToDenoModule";
import * as path from "path";
import { assert } from "evt/tools/typeSafety";
import { getInstalledVersionPackageJsonFactory } from "../../lib/getInstalledVersionPackageJson";


(async () => {

    {

        let std_out = "";

        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJsonFactory({
            "projectPath": path.join(__dirname, "..", "..", "..", "res", "test_resolve_1"),
        });

        const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModuleFactory({
            getInstalledVersionPackageJson,
            "dependencies": {
                "js-yaml": "~3.13.0"
            },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args: any[]) => std_out += args.join(" ")
        });

        const nodeToDenoModuleResolutionResult = await resolveNodeModuleToDenoModule({ "nodeModuleName": "js-yaml" });

        assert(nodeToDenoModuleResolutionResult.result === "SUCCESS");


        assert(
            await nodeToDenoModuleResolutionResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
            "https://deno.land/x/js_yaml_port@3.13.1/js-yaml.js"
        );

        assert(std_out === "");

    }

    {

        let std_out = "";

        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJsonFactory({
            "projectPath": path.join(__dirname, "..", "..", "..", "res", "test_resolve_2"),
        });

        const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModuleFactory({
            getInstalledVersionPackageJson,
            "dependencies": {
                "js-yaml": "~3.13.0"
            },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args: any[]) => std_out += args.join(" ")
        });

        const nodeToDenoModuleResolutionResult = await resolveNodeModuleToDenoModule({ "nodeModuleName": "js-yaml" });

        assert(nodeToDenoModuleResolutionResult.result === "SUCCESS");

        assert(
            await nodeToDenoModuleResolutionResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
            "https://deno.land/x/js_yaml_port@master/js-yaml.js"
        );


        /*
        const expected_std_out =
            `WARNING: Specific version 3.13.0 could not be found
GET https://deno.land/x/js_yaml_port@3.13.0/js-yaml.js 404
GET https://deno.land/x/js_yaml_port@v3.13.0/js-yaml.js 404
Falling back to master branch
This mean that the Node and the Deno distribution of your module will not run the same version of this dependency.`;

        assert(std_out === expected_std_out);
        */

        assert(std_out.length !== 0);

    }



    {

        let std_out = "";

        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJsonFactory({
            "projectPath": path.join(__dirname, "..", "..", "..", "res", "test_resolve_3"),
        });

        const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModuleFactory({
            getInstalledVersionPackageJson,
            "dependencies": { "ts-md5": "1.2.7" },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args: any[]) => std_out += args.join(" ")
        });

        const nodeToDenoModuleResolutionResult = await resolveNodeModuleToDenoModule({ "nodeModuleName": "ts-md5" });

        assert(nodeToDenoModuleResolutionResult.result === "SUCCESS");

        assert(
            await nodeToDenoModuleResolutionResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
            "https://raw.githubusercontent.com/garronej/ts-md5/1.2.7/mod.ts"
        );


        assert(std_out === "");


    }



    {

        let std_out = "";

        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJsonFactory({
            "projectPath": path.join(__dirname, "..", "..", "..", "res", "test_resolve_4"),
        });

        const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModuleFactory({
            getInstalledVersionPackageJson,
            "dependencies": { "my-dummy-npm-and-deno-module": "0.2.0" },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args: any[]) => std_out += args.join(" ")
        });

        const nodeToDenoModuleResolutionResult = await resolveNodeModuleToDenoModule({ "nodeModuleName": "my-dummy-npm-and-deno-module" });

        assert(nodeToDenoModuleResolutionResult.result === "SUCCESS");

        assert(
            await nodeToDenoModuleResolutionResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
            "https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/0.2.0/mod.ts"
        );


        assert(std_out === "");

    }



    {

        let std_out = "";

        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJsonFactory({
            "projectPath": path.join(__dirname, "..", "..", "..", "res", "test_resolve_5"),
        });

        const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModuleFactory({
            getInstalledVersionPackageJson,
            "dependencies": { "ts-md5": "garronej/ts-md5#1.2.7" },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args: any[]) => std_out += args.join(" ")
        });


        const nodeToDenoModuleResolutionResult = await resolveNodeModuleToDenoModule({ "nodeModuleName": "ts-md5" });

        assert(nodeToDenoModuleResolutionResult.result === "SUCCESS");

        assert(
            await nodeToDenoModuleResolutionResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
            "https://raw.githubusercontent.com/garronej/ts-md5/1.2.7/mod.ts"
        );


        assert(std_out === "");


    }


    {

        let std_out = "";

        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJsonFactory({
            "projectPath": path.join(__dirname, "..", "..", "..", "res", "test_resolve_6"),
        });

        const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModuleFactory({
            getInstalledVersionPackageJson,
            "dependencies": {
                "minimal-polyfills": "~2.0.0"
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
            "https://raw.githubusercontent.com/garronej/minimal_polyfills/2.0.1/mod.ts"
        );


        assert(std_out === "");

    }

    console.log("PASS");

})();
