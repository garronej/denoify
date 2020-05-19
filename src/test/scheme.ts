
import { Scheme } from "../lib/Scheme";

import * as inDepth from "evt/dist/tools/inDepth";
import { assert } from "evt/dist/tools/typeSafety";

{

    const expect = {
        "type": "github",
        "userOrOrg": "KSXGitHub",
        "repositoryName": "simple-js-yaml-port-for-deno",
        "branch": undefined
    } as const;

    assert(
        inDepth.same(
            Scheme.parse("KSXGitHub/simple-js-yaml-port-for-deno"),
            expect
        )
    );

    assert(
        inDepth.same(
            Scheme.parse("github:KSXGitHub/simple-js-yaml-port-for-deno"),
            expect
        )
    );

}

{

    const expect = {
        "type": "github",
        "userOrOrg": "KSXGitHub",
        "repositoryName": "simple-js-yaml-port-for-deno",
        "branch": "3.12.1"
    } as const;

    assert(
        inDepth.same(
            Scheme.parse("KSXGitHub/simple-js-yaml-port-for-deno#3.12.1"),
            expect
        )
    );

    assert(
        inDepth.same(
            Scheme.parse("github:KSXGitHub/simple-js-yaml-port-for-deno#3.12.1"),
            expect
        )
    );

}


assert(
    inDepth.same(
        Scheme.parse("https://deno.land/x/js_yaml_port/js-yaml.js"),
        {
            type: 'url',
            urlType: 'deno.land',
            baseUrlWithoutBranch: 'https://deno.land/x/js_yaml_port',
            branch: undefined,
            pathToIndex: 'js-yaml.js'
        }
    )
);

assert(
    inDepth.same(
        Scheme.parse("https://deno.land/std@master/node/events.ts"),
        {
            type: 'url',
            urlType: 'deno.land',
            baseUrlWithoutBranch: 'https://deno.land/std',
            branch: 'master',
            pathToIndex: 'node/events.ts'
        }
    )
);

assert(
    inDepth.same(
        Scheme.parse("https://deno.land/x/foo@1.2.3/mod.js"),
        {
            type: 'url',
            urlType: 'deno.land',
            baseUrlWithoutBranch: 'https://deno.land/x/foo',
            branch: '1.2.3',
            pathToIndex: 'mod.js'
        }

    )
);

{

    const expected = {
        type: 'url',
        urlType: 'github',
        baseUrlWithoutBranch:
            'https://raw.github.com/KSXGitHub/simple-js-yaml-port-for-deno/',
        branch: '3.12.1',
        pathToIndex: 'js-yaml.js'
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
        type: 'url',
        urlType: 'github',
        baseUrlWithoutBranch:
            'https://raw.github.com/garronej/deno/',
        branch: 'master',
        pathToIndex: 'std/node/util.ts'
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









