"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resolve_1 = require("../lib/resolve");
const path = require("path");
const inDepth = require("evt/dist/tools/inDepth");
const typeSafety_1 = require("evt/dist/tools/typeSafety");
(async () => {
    console.log("NOTE: This test require an internet connection");
    {
        let std_out = "";
        const { resolve } = resolve_1.resolveFactory({
            "projectPath": path.join(__dirname, "..", "..", "res", "test_resolve_1"),
            "dependencies": {
                "js-yaml": "~3.13.0"
            },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args) => std_out += args.join(" ")
        });
        typeSafety_1.assert(inDepth.same(await resolve({ "nodeModuleName": "js-yaml" }), {
            type: 'HANDMADE PORT',
            scheme: {
                type: 'url',
                urlType: 'deno.land',
                baseUrlWithoutBranch: 'https://deno.land/x/js_yaml_port',
                branch: '3.13.1',
                pathToIndex: 'js-yaml.js'
            }
        }));
        typeSafety_1.assert(std_out === "");
    }
    {
        let std_out = "";
        const { resolve } = resolve_1.resolveFactory({
            "projectPath": path.join(__dirname, "..", "..", "res", "test_resolve_2"),
            "dependencies": {
                "js-yaml": "~3.13.0"
            },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args) => std_out += args.join(" ")
        });
        typeSafety_1.assert(inDepth.same(await resolve({ "nodeModuleName": "js-yaml" }), {
            type: 'HANDMADE PORT',
            scheme: {
                type: 'url',
                urlType: 'deno.land',
                baseUrlWithoutBranch: 'https://deno.land/x/js_yaml_port',
                branch: "master",
                pathToIndex: 'js-yaml.js'
            }
        }));
        const expected_std_out = `WARNING: Specific version 3.13.0 could not be found
GET https://deno.land/x/js_yaml_port@v3.13.0/js-yaml.js 404
GET https://deno.land/x/js_yaml_port@3.13.0/js-yaml.js 404
Falling back to master branch
This mean that the Node and the Deno distribution of your module will not run the same version of this dependency.`;
        typeSafety_1.assert(std_out === expected_std_out);
    }
    {
        let std_out = "";
        const { resolve } = resolve_1.resolveFactory({
            "projectPath": path.join(__dirname, "..", "..", "res", "test_resolve_3"),
            "dependencies": { "ts-md5": "1.2.7" },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args) => std_out += args.join(" ")
        });
        typeSafety_1.assert(inDepth.same(await resolve({ "nodeModuleName": "ts-md5" }), {
            type: 'HANDMADE PORT',
            scheme: {
                type: 'github',
                userOrOrg: 'garronej',
                repositoryName: 'ts-md5',
                branch: '1.2.7'
            }
        }));
        typeSafety_1.assert(std_out === "");
    }
    {
        let std_out = "";
        const { resolve } = resolve_1.resolveFactory({
            "projectPath": path.join(__dirname, "..", "..", "res", "test_resolve_4"),
            "dependencies": { "my-dummy-npm-and-deno-module": "0.2.0" },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args) => std_out += args.join(" ")
        });
        typeSafety_1.assert(inDepth.same(await resolve({ "nodeModuleName": "my-dummy-npm-and-deno-module" }), {
            type: 'DENOIFIED MODULE',
            scheme: {
                type: 'github',
                userOrOrg: 'garronej',
                repositoryName: 'my_dummy_npm_and_deno_module',
                branch: "0.2.0"
            },
            tsconfigOutDir: './dist'
        }));
        typeSafety_1.assert(std_out === "");
    }
    {
        let std_out = "";
        const { resolve } = resolve_1.resolveFactory({
            "projectPath": path.join(__dirname, "..", "..", "res", "test_resolve_5"),
            "dependencies": { "ts-md5": "garronej/ts-md5#1.2.7" },
            "devDependencies": {},
            "userProvidedPorts": {},
            "log": (...args) => std_out += args.join(" ")
        });
        typeSafety_1.assert(inDepth.same(await resolve({ "nodeModuleName": "ts-md5" }), {
            type: 'DENOIFIED MODULE',
            scheme: {
                type: 'github',
                userOrOrg: 'garronej',
                repositoryName: 'ts-md5',
                branch: '1.2.7'
            },
            tsconfigOutDir: './dist'
        }));
        typeSafety_1.assert(std_out === "");
    }
    console.log("PASS");
})();
//# sourceMappingURL=resolve.js.map