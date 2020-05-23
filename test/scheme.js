"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Scheme_1 = require("../lib/Scheme");
const inDepth = require("evt/tools/inDepth");
const typeSafety_1 = require("evt/tools/typeSafety");
(async () => {
    console.log("NOTE: This test require an internet connection");
    {
        const expectedScheme = {
            "type": "github",
            "userOrOrg": "garronej",
            "repositoryName": "ts-md5",
            "branch": undefined
        };
        for (const prefix of ["", "github:"]) {
            typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse(`${prefix}garronej/ts-md5`), expectedScheme));
            typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse(`${prefix}garronej/ts-md5#1.2.7`), {
                ...expectedScheme,
                "branch": "1.2.7"
            }));
        }
        typeSafety_1.assert(Scheme_1.Scheme.buildUrl(expectedScheme, {})
            ===
                "https://raw.githubusercontent.com/garronej/ts-md5/master/mod.ts");
        typeSafety_1.assert(Scheme_1.Scheme.buildUrl(expectedScheme, {
            "branch": "1.2.7",
            "pathToFile": "deno_dist/parallel_hasher.ts"
        })
            ===
                "https://raw.githubusercontent.com/garronej/ts-md5/1.2.7/deno_dist/parallel_hasher.ts");
        {
            const version = "1.2.7";
            typeSafety_1.assert(inDepth.same(await Scheme_1.Scheme.resolveVersion(expectedScheme, { version }), {
                "couldConnect": true,
                "scheme": {
                    ...expectedScheme,
                    "branch": version
                },
                "notTheExactVersionWarning": undefined
            }));
        }
        typeSafety_1.assert(inDepth.same(await Scheme_1.Scheme.resolveVersion(expectedScheme, { "version": "1.0.0" }).then(resolveVersionResult => {
            typeSafety_1.assert(resolveVersionResult.couldConnect);
            typeSafety_1.assert(!!resolveVersionResult.notTheExactVersionWarning);
            return resolveVersionResult.scheme;
        }), { ...expectedScheme, "branch": "master" }));
        typeSafety_1.assert(inDepth.same(await Scheme_1.Scheme.resolveVersion(expectedScheme, { "version": "master" }), {
            "couldConnect": true,
            "scheme": {
                ...expectedScheme,
                "branch": "master"
            },
            "notTheExactVersionWarning": undefined
        }));
    }
    {
        const expectedScheme = {
            "type": "url",
            "urlType": "deno.land",
            "baseUrlWithoutBranch": "https://deno.land/x/evt",
            "pathToIndex": "mod.ts",
            "branch": "master"
        };
        const inputUrl = "https://deno.land/x/evt/mod.ts";
        typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse(inputUrl), expectedScheme));
        for (const branch of ["master", "1.7.0"]) {
            typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse(`https://deno.land/x/evt@${branch}/mod.ts`), {
                ...expectedScheme,
                branch
            }));
        }
        typeSafety_1.assert(Scheme_1.Scheme.buildUrl(expectedScheme, {})
            ===
                inputUrl);
        {
            const branch = "1.7.0";
            const pathToFile = "tools/typeSafety/assert.ts";
            typeSafety_1.assert(Scheme_1.Scheme.buildUrl(expectedScheme, {
                branch,
                pathToFile
            })
                ===
                    `https://deno.land/x/evt@${branch}/${pathToFile}`);
        }
        {
            const version = "1.6.8";
            typeSafety_1.assert(inDepth.same(await Scheme_1.Scheme.resolveVersion(expectedScheme, { version }), {
                "couldConnect": true,
                "scheme": {
                    ...expectedScheme,
                    "branch": `v${version}`
                },
                "notTheExactVersionWarning": undefined
            }));
        }
        typeSafety_1.assert(inDepth.same(await Scheme_1.Scheme.resolveVersion(expectedScheme, { "version": "0.0.1" }).then(resolveVersionResult => {
            typeSafety_1.assert(resolveVersionResult.couldConnect);
            typeSafety_1.assert(!!resolveVersionResult.notTheExactVersionWarning);
            return resolveVersionResult.scheme;
        }), expectedScheme));
    }
    {
        const expectedScheme = {
            "type": "url",
            "urlType": "github",
            "baseUrlWithoutBranch": "https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module",
            "branch": "0.2.0",
            "pathToIndex": "mod.ts"
        };
        const inputUrl = "https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/0.2.0/mod.ts";
        typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse(inputUrl), expectedScheme));
        typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse(inputUrl.replace("githubusercontent", "github")), expectedScheme));
        typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse(inputUrl.replace("0.2.0", "master")), {
            ...expectedScheme,
            "branch": "master"
        }));
        typeSafety_1.assert(Scheme_1.Scheme.buildUrl(expectedScheme, {})
            ===
                inputUrl);
        {
            const branch = "master";
            const pathToFile = "deno_dist/lib/Cat.ts";
            typeSafety_1.assert(Scheme_1.Scheme.buildUrl(expectedScheme, {
                branch,
                pathToFile
            })
                ===
                    inputUrl
                        .replace("0.2.0", branch)
                        .replace("mod.ts", pathToFile));
        }
        {
            const version = "0.2.0";
            typeSafety_1.assert(inDepth.same(await Scheme_1.Scheme.resolveVersion(expectedScheme, { version }), {
                "couldConnect": true,
                "scheme": {
                    ...expectedScheme,
                    "branch": version
                },
                "notTheExactVersionWarning": undefined
            }));
        }
        typeSafety_1.assert(inDepth.same(await Scheme_1.Scheme.resolveVersion(expectedScheme, { "version": "0.0.33" }).then(resolveVersionResult => {
            typeSafety_1.assert(resolveVersionResult.couldConnect);
            typeSafety_1.assert(!!resolveVersionResult.notTheExactVersionWarning);
            return resolveVersionResult.scheme;
        }), expectedScheme));
    }
    //Legacy tests
    typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse("https://deno.land/x/js_yaml_port/js-yaml.js"), {
        "type": "url",
        "urlType": "deno.land",
        "baseUrlWithoutBranch": "https://deno.land/x/js_yaml_port",
        "branch": "master",
        "pathToIndex": "js-yaml.js"
    }));
    typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse("https://deno.land/std@master/node/events.ts"), {
        "type": "url",
        "urlType": "deno.land",
        "baseUrlWithoutBranch": "https://deno.land/std",
        "branch": "master",
        "pathToIndex": "node/events.ts"
    }));
    typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse("https://deno.land/x/foo@1.2.3/mod.js"), {
        "type": "url",
        "urlType": "deno.land",
        "baseUrlWithoutBranch": "https://deno.land/x/foo",
        "branch": "1.2.3",
        "pathToIndex": "mod.js"
    }));
    {
        const expected = {
            "type": "url",
            "urlType": "github",
            "baseUrlWithoutBranch": "https://raw.githubusercontent.com/KSXGitHub/simple-js-yaml-port-for-deno",
            "branch": "3.12.1",
            "pathToIndex": "js-yaml.js"
        };
        typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse("https://raw.githubusercontent.com/KSXGitHub/simple-js-yaml-port-for-deno/3.12.1/js-yaml.js"), expected));
        typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse("https://raw.githubusercontent.com/KSXGitHub/simple-js-yaml-port-for-deno/3.12.1/js-yaml.js"), expected));
    }
    {
        const expected = {
            "type": "url",
            "urlType": "github",
            "baseUrlWithoutBranch": "https://raw.githubusercontent.com/garronej/deno",
            "branch": "master",
            "pathToIndex": "std/node/util.ts"
        };
        typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse("https://raw.githubusercontent.com/garronej/deno/master/std/node/util.ts"), expected));
        typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse("https://raw.githubusercontent.com/garronej/deno/master/std/node/util.ts"), expected));
    }
    console.log("PASS");
})();
//# sourceMappingURL=scheme.js.map