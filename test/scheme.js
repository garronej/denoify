"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Scheme_1 = require("../lib/Scheme");
var inDepth = require("evt/dist/tools/inDepth");
var typeSafety_1 = require("evt/dist/tools/typeSafety");
{
    var expect = {
        "type": "github",
        "userOrOrg": "KSXGitHub",
        "repositoryName": "simple-js-yaml-port-for-deno",
        "branch": undefined
    };
    typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse("KSXGitHub/simple-js-yaml-port-for-deno"), expect));
    typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse("github:KSXGitHub/simple-js-yaml-port-for-deno"), expect));
}
{
    var expect = {
        "type": "github",
        "userOrOrg": "KSXGitHub",
        "repositoryName": "simple-js-yaml-port-for-deno",
        "branch": "3.12.1"
    };
    typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse("KSXGitHub/simple-js-yaml-port-for-deno#3.12.1"), expect));
    typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse("github:KSXGitHub/simple-js-yaml-port-for-deno#3.12.1"), expect));
}
typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse("https://deno.land/x/js_yaml_port/js-yaml.js"), {
    type: 'url',
    urlType: 'deno.land',
    baseUrlWithoutBranch: 'https://deno.land/x/js_yaml_port',
    branch: undefined,
    pathToIndex: 'js-yaml.js'
}));
typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse("https://deno.land/std@master/node/events.ts"), {
    type: 'url',
    urlType: 'deno.land',
    baseUrlWithoutBranch: 'https://deno.land/std',
    branch: 'master',
    pathToIndex: 'node/events.ts'
}));
typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse("https://deno.land/x/foo@1.2.3/mod.js"), {
    type: 'url',
    urlType: 'deno.land',
    baseUrlWithoutBranch: 'https://deno.land/x/foo',
    branch: '1.2.3',
    pathToIndex: 'mod.js'
}));
{
    var expected = {
        type: 'url',
        urlType: 'github',
        baseUrlWithoutBranch: 'https://raw.github.com.com/KSXGitHub/simple-js-yaml-port-for-deno/',
        branch: '3.12.1',
        pathToIndex: 'js-yaml.js'
    };
    typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse("https://raw.github.com/KSXGitHub/simple-js-yaml-port-for-deno/3.12.1/js-yaml.js"), expected));
    typeSafety_1.assert(inDepth.same(Scheme_1.Scheme.parse("https://raw.githubusercontent.com/KSXGitHub/simple-js-yaml-port-for-deno/3.12.1/js-yaml.js"), expected));
}
console.log("PASS");
//# sourceMappingURL=scheme.js.map