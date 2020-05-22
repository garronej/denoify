
import { Scheme } from "../lib/Scheme";

import * as inDepth from "evt/tools/inDepth";
import { assert } from "evt/tools/typeSafety";

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
                    Scheme.parse(`${prefix}garronej/ts-md5#1.2.7`),
                    {
                        ...expectedScheme,
                        "branch": "1.2.7"
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
                    "branch": "1.2.7",
                    "pathToFile": "deno_dist/parallel_hasher.ts"
                }
            )
            ===
            "https://raw.github.com/garronej/ts-md5/1.2.7/deno_dist/parallel_hasher.ts"
        );


        {

            const version = "1.2.7";

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
                            "branch": version
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
                { ...expectedScheme, "branch": "master" }
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
            "branch": "master"
        } as const;

        const inputUrl = "https://deno.land/x/evt/mod.ts";

        assert(
            inDepth.same(
                Scheme.parse(inputUrl),
                expectedScheme
            )
        );

        for (const branch of ["master", "1.7.0"]) {

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

        {

            const branch = "1.7.0";
            const pathToFile = "tools/typeSafety/assert.ts";

            assert(
                Scheme.buildUrl(
                    expectedScheme,
                    {
                        branch,
                        pathToFile
                    }
                )
                ===
                `https://deno.land/x/evt@${branch}/${pathToFile}`
            );

        }

        {

            const version = "1.6.8";

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
                            "branch": `v${version}`
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
            "branch": "0.2.0",
            "pathToIndex": "mod.ts"
        };

        const inputUrl = "https://raw.github.com/garronej/my_dummy_npm_and_deno_module/0.2.0/mod.ts";

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
                    inputUrl.replace("0.2.0", "master")
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
                    .replace("0.2.0", branch)
                    .replace("mod.ts", pathToFile)
            );

        }

        {

            const version = "0.2.0";

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
                            "branch": version
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
                "branch": "master",
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
