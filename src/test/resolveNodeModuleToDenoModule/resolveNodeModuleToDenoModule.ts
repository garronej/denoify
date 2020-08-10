
import { resolveNodeModuleToDenoModuleFactory } from "../../lib/resolveNodeModuleToDenoModule";
import * as path from "path";
import { assert } from "evt/tools/typeSafety";
import { getInstalledVersionPackageJsonFactory } from "../../lib/getInstalledVersionPackageJson";
import * as fs from "fs";
import { getThirdPartyDenoModuleInfos } from "../../lib/getThirdPartyDenoModuleInfos";


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
        }); //NOTE: The version in package.json does not exist as a repo TAG.

        const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModuleFactory({
            getInstalledVersionPackageJson,
            "dependencies": {
                "js-yaml": "...irrelevant..."
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
            `https://deno.land/x/js_yaml_port@${
            (await getThirdPartyDenoModuleInfos({ "denoModuleName": "js_yaml_port" }))!.latestVersion
            }/js-yaml.js`
        );

        const expected_std_out =
        `Can't lookup version 3.13.0 for module {"type":"DENO.LAND URL","isStd":false,"baseUrlWithoutBranch":"https://deno.land/x/js_yaml_port","pathToIndex":"js-yaml.js"}, falling back to 3.14.0`;

        assert(std_out === expected_std_out);

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
            "https://raw.githubusercontent.com/garronej/ts-md5/v1.2.7/deno_dist/mod.ts"
        );


        assert(std_out === "");


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

        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJsonFactory({
            projectPath
        });

        const { resolveNodeModuleToDenoModule } = resolveNodeModuleToDenoModuleFactory({
            getInstalledVersionPackageJson,
            //NOTE: We put 0.0.0 to show that it is not took into account only after the installed version.
            "dependencies": { "ts-md5": "garronej/ts-md5#0.0.0" },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args: any[]) => std_out += args.join(" ")
        });


        const nodeToDenoModuleResolutionResult = await resolveNodeModuleToDenoModule({ "nodeModuleName": "ts-md5" });

        assert(nodeToDenoModuleResolutionResult.result === "SUCCESS");

        assert(
            await nodeToDenoModuleResolutionResult.getValidImportUrl({ "target": "DEFAULT EXPORT" })
            ===
            `https://raw.githubusercontent.com/garronej/ts-md5/v${
            JSON.parse(
                fs.readFileSync(
                    path.join(projectPath, "node_modules", "ts-md5", "package.json")
                ).toString("utf8")
            )["version"]
            }/deno_dist/mod.ts`
        );


        assert(std_out === "");


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
