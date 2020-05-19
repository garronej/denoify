"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Scheme_1 = require("../lib/Scheme");
const inDepth = require("evt/dist/tools/inDepth");
const typeSafety_1 = require("evt/dist/tools/typeSafety");
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
            typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse(`${prefix}garronej/ts-md5#v1.2.7`), {
                ...expectedScheme,
                "branch": "v1.2.7"
            }));
        }
        typeSafety_1.assert(Scheme_1.Scheme.buildUrl(expectedScheme, {})
            ===
                "https://raw.github.com/garronej/ts-md5/master/mod.ts");
        typeSafety_1.assert(Scheme_1.Scheme.buildUrl(expectedScheme, {
            "branch": "v1.2.7",
            "pathToFile": "deno_dist/parallel_hasher.ts"
        })
            ===
                "https://raw.github.com/garronej/ts-md5/v1.2.7/deno_dist/parallel_hasher.ts");
        for (const version of ["1.2.7", "v1.2.7"]) {
            typeSafety_1.assert(inDepth.same(await Scheme_1.Scheme.resolveVersion(expectedScheme, { version }), {
                "couldConnect": true,
                "scheme": {
                    ...expectedScheme,
                    "branch": "v1.2.7"
                },
                "notTheExactVersionWarning": undefined
            }));
        }
        typeSafety_1.assert(inDepth.same(await Scheme_1.Scheme.resolveVersion(expectedScheme, { "version": "1.0.0" }).then(resolveVersionResult => {
            typeSafety_1.assert(resolveVersionResult.couldConnect);
            typeSafety_1.assert(!!resolveVersionResult.notTheExactVersionWarning);
            return resolveVersionResult.scheme;
        }), expectedScheme));
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
            "branch": undefined
        };
        const inputUrl = "https://deno.land/x/evt/mod.ts";
        typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse(inputUrl), expectedScheme));
        for (const branch of ["master", "v1.6.8"]) {
            typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse(`https://deno.land/x/evt@${branch}/mod.ts`), {
                ...expectedScheme,
                branch
            }));
        }
        typeSafety_1.assert(Scheme_1.Scheme.buildUrl(expectedScheme, {})
            ===
                inputUrl);
        typeSafety_1.assert(Scheme_1.Scheme.buildUrl(expectedScheme, {
            "branch": "v1.6.8",
            "pathToFile": "deno_dist/tools/typeSafety/assert.ts"
        })
            ===
                "https://deno.land/x/evt@v1.6.8/deno_dist/tools/typeSafety/assert.ts");
        for (const version of ["1.6.8", "v1.6.8"]) {
            typeSafety_1.assert(inDepth.same(await Scheme_1.Scheme.resolveVersion(expectedScheme, { version }), {
                "couldConnect": true,
                "scheme": {
                    ...expectedScheme,
                    "branch": "v1.6.8"
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
            "baseUrlWithoutBranch": "https://raw.github.com/garronej/my_dummy_npm_and_deno_module",
            "branch": "v0.1.0",
            "pathToIndex": "mod.ts"
        };
        const inputUrl = "https://raw.github.com/garronej/my_dummy_npm_and_deno_module/v0.1.0/mod.ts";
        typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse(inputUrl), expectedScheme));
        typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse(inputUrl.replace("github", "githubusercontent")), expectedScheme));
        typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse(inputUrl.replace("v0.1.0", "master")), {
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
                        .replace("v0.1.0", branch)
                        .replace("mod.ts", pathToFile));
        }
        for (const version of ["0.1.0", "v0.1.0"]) {
            typeSafety_1.assert(inDepth.same(await Scheme_1.Scheme.resolveVersion(expectedScheme, { version }), {
                "couldConnect": true,
                "scheme": {
                    ...expectedScheme,
                    "branch": "v0.1.0"
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
        "branch": undefined,
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
            "baseUrlWithoutBranch": "https://raw.github.com/KSXGitHub/simple-js-yaml-port-for-deno",
            "branch": "3.12.1",
            "pathToIndex": "js-yaml.js"
        };
        typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse("https://raw.github.com/KSXGitHub/simple-js-yaml-port-for-deno/3.12.1/js-yaml.js"), expected));
        typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse("https://raw.githubusercontent.com/KSXGitHub/simple-js-yaml-port-for-deno/3.12.1/js-yaml.js"), expected));
    }
    {
        const expected = {
            "type": "url",
            "urlType": "github",
            "baseUrlWithoutBranch": "https://raw.github.com/garronej/deno",
            "branch": "master",
            "pathToIndex": "std/node/util.ts"
        };
        typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse("https://raw.github.com/garronej/deno/master/std/node/util.ts"), expected));
        typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse("https://raw.githubusercontent.com/garronej/deno/master/std/node/util.ts"), expected));
    }
    console.log("PASS");
})();
//# sourceMappingURL=scheme.js.map