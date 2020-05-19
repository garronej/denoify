
import { Scheme } from "../lib/Scheme";

import * as inDepth from "evt/dist/tools/inDepth";
import { assert } from "evt/dist/tools/typeSafety";

(async () => {

    console.log("NOTE: This test require an internet connection");

    {

        const expectedScheme: Scheme.GitHub = {
            "type": "github",
            "userOrOrg": "garronej",
            "repositoryName": "ts-md5",
            "branch": undefined
        } as const;

        for (const prefix of ["", "github:"]) {

            assert(
                inDepth.same(
                    Scheme.parse(`${prefix}garronej/ts-md5`),
                    expectedScheme
                )
            );

            assert(
                inDepth.same(
                    Scheme.parse(`${prefix}garronej/ts-md5#v1.2.7`),
                    {
                        ...expectedScheme,
                        "branch": "v1.2.7"
                    }
                )
            );

        }


        assert(
            Scheme.buildUrl(expectedScheme, {})
            ===
            "https://raw.github.com/garronej/ts-md5/master/mod.ts"
        );

        assert(
            Scheme.buildUrl(expectedScheme,
                {
                    "branch": "v1.2.7",
                    "pathToFile": "deno_dist/parallel_hasher.ts"
                }
            )
            ===
            "https://raw.github.com/garronej/ts-md5/v1.2.7/deno_dist/parallel_hasher.ts"
        );

        for (const version of ["1.2.7", "v1.2.7"]) {

            assert(
                inDepth.same(
                    await Scheme.resolveVersion(
                        expectedScheme,
                        { version }
                    ),
                    {
                        "couldConnect": true,
                        "scheme": {
                            ...expectedScheme,
                            "branch": "v1.2.7"
                        },
                        "notTheExactVersionWarning": undefined
                    }
                )
            );

        }

        assert(
            inDepth.same(
                await Scheme.resolveVersion(
                    expectedScheme,
                    { "version": "1.0.0" }
                ).then(resolveVersionResult => {

                    assert(resolveVersionResult.couldConnect);
                    assert(!!resolveVersionResult.notTheExactVersionWarning);
                    return resolveVersionResult.scheme;

                }),
                expectedScheme
            )
        );

        assert(
            inDepth.same(
                await Scheme.resolveVersion(
                    expectedScheme,
                    { "version": "master" }
                ),
                {
                    "couldConnect": true,
                    "scheme": {
                        ...expectedScheme,
                        "branch": "master"
                    },
                    "notTheExactVersionWarning": undefined
                }
            )
        );

    }




    {

        const expectedScheme: Scheme.Url.DenoLand = {
            "type": "url",
            "urlType": "deno.land",
            "baseUrlWithoutBranch": "https://deno.land/x/evt",
            "pathToIndex": "mod.ts",
            "branch": undefined
        } as const;

        const inputUrl = "https://deno.land/x/evt/mod.ts";

        assert(
            inDepth.same(
                Scheme.parse(inputUrl),
                expectedScheme
            )
        );

        for (const branch of ["master", "v1.6.8"]) {

            assert(
                inDepth.same(
                    Scheme.parse(`https://deno.land/x/evt@${branch}/mod.ts`),
                    {
                        ...expectedScheme,
                        branch
                    }
                )
            );

        }

        assert(
            Scheme.buildUrl(expectedScheme, {})
            ===
            inputUrl
        );

        assert(
            Scheme.buildUrl(
                expectedScheme,
                {
                    "branch": "v1.6.8",
                    "pathToFile": "deno_dist/tools/typeSafety/assert.ts"
                }
            )
            ===
            "https://deno.land/x/evt@v1.6.8/deno_dist/tools/typeSafety/assert.ts"
        );

        for (const version of ["1.6.8", "v1.6.8"]) {

            assert(
                inDepth.same(
                    await Scheme.resolveVersion(
                        expectedScheme,
                        { version }
                    ),
                    {
                        "couldConnect": true,
                        "scheme": {
                            ...expectedScheme,
                            "branch": "v1.6.8"
                        },
                        "notTheExactVersionWarning": undefined
                    }
                )
            );

        }

        assert(
            inDepth.same(
                await Scheme.resolveVersion(
                    expectedScheme,
                    { "version": "0.0.1" }
                ).then(resolveVersionResult => {

                    assert(resolveVersionResult.couldConnect);
                    assert(!!resolveVersionResult.notTheExactVersionWarning);
                    return resolveVersionResult.scheme;

                }),
                expectedScheme
            )
        );

    }

    {

        const expectedScheme: Scheme.Url.GitHub = {
            "type": "url",
            "urlType": "github",
            "baseUrlWithoutBranch":
                "https://raw.github.com/garronej/my_dummy_npm_and_deno_module",
            "branch": "v0.1.0",
            "pathToIndex": "mod.ts"
        };

        const inputUrl = "https://raw.github.com/garronej/my_dummy_npm_and_deno_module/v0.1.0/mod.ts";

        assert(
            inDepth.same(
                Scheme.parse(inputUrl),
                expectedScheme
            )
        );

        assert(
            inDepth.same(
                Scheme.parse(
                    inputUrl.replace(
                        "github",
                        "githubusercontent"
                    )
                ),
                expectedScheme
            )
        );

        assert(
            inDepth.same(
                Scheme.parse(
                    inputUrl.replace("v0.1.0", "master")
                ),
                {
                    ...expectedScheme,
                    "branch": "master"
                }
            )
        );

        assert(
            Scheme.buildUrl(expectedScheme, {})
            ===
            inputUrl
        );

        {

            const branch = "master";
            const pathToFile = "deno_dist/lib/Cat.ts";

            assert(
                Scheme.buildUrl(
                    expectedScheme,
                    {
                        branch,
                        pathToFile
                    }
                )
                ===
                inputUrl
                    .replace("v0.1.0", branch)
                    .replace("mod.ts", pathToFile)
            );

        }

        for (const version of ["0.1.0", "v0.1.0"]) {

            assert(
                inDepth.same(
                    await Scheme.resolveVersion(
                        expectedScheme,
                        { version }
                    ),
                    {
                        "couldConnect": true,
                        "scheme": {
                            ...expectedScheme,
                            "branch": "v0.1.0"
                        },
                        "notTheExactVersionWarning": undefined
                    }
                )
            );

        }

        assert(
            inDepth.same(
                await Scheme.resolveVersion(
                    expectedScheme,
                    { "version": "0.0.33" }
                ).then(resolveVersionResult => {

                    assert(resolveVersionResult.couldConnect);
                    assert(!!resolveVersionResult.notTheExactVersionWarning);
                    return resolveVersionResult.scheme;

                }),
                expectedScheme
            )
        );

    }

    //Legacy tests

    assert(
        inDepth.same(
            Scheme.parse("https://deno.land/x/js_yaml_port/js-yaml.js"),
            {
                "type": "url",
                "urlType": "deno.land",
                "baseUrlWithoutBranch": "https://deno.land/x/js_yaml_port",
                "branch": undefined,
                "pathToIndex": "js-yaml.js"
            }
        )
    );

    assert(
        inDepth.same(
            Scheme.parse("https://deno.land/std@master/node/events.ts"),
            {
                "type": "url",
                "urlType": "deno.land",
                "baseUrlWithoutBranch": "https://deno.land/std",
                "branch": "master",
                "pathToIndex": "node/events.ts"
            }
        )
    );

    assert(
        inDepth.same(
            Scheme.parse("https://deno.land/x/foo@1.2.3/mod.js"),
            {
                "type": "url",
                "urlType": "deno.land",
                "baseUrlWithoutBranch": "https://deno.land/x/foo",
                "branch": "1.2.3",
                "pathToIndex": "mod.js"
            }

        )
    );

    {

        const expected = {
            "type": "url",
            "urlType": "github",
            "baseUrlWithoutBranch": "https://raw.github.com/KSXGitHub/simple-js-yaml-port-for-deno",
            "branch": "3.12.1",
            "pathToIndex": "js-yaml.js"
        } as const;

        assert(
            inDepth.same(
                Scheme.parse("https://raw.github.com/KSXGitHub/simple-js-yaml-port-for-deno/3.12.1/js-yaml.js"),
                expected
            )
        );

        assert(
            inDepth.same(
                Scheme.parse("https://raw.githubusercontent.com/KSXGitHub/simple-js-yaml-port-for-deno/3.12.1/js-yaml.js"),
                expected
            )
        );

    }

    {

        const expected = {
            "type": "url",
            "urlType": "github",
            "baseUrlWithoutBranch": "https://raw.github.com/garronej/deno",
            "branch": "master",
            "pathToIndex": "std/node/util.ts"
        } as const;

        assert(
            inDepth.same(
                Scheme.parse("https://raw.github.com/garronej/deno/master/std/node/util.ts"),
                expected
            )
        );

        assert(
            inDepth.same(
                Scheme.parse("https://raw.githubusercontent.com/garronej/deno/master/std/node/util.ts"),
                expected
            )
        );

    }

    console.log("PASS");


})();
