"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is404_1 = require("../tools/is404");
const urlJoin_1 = require("../tools/urlJoin");
var Scheme;
(function (Scheme) {
    let GitHub;
    (function (GitHub) {
        function matchStr(strScheme) {
            return /^(?:github:)?[^\/]+\/[^\/]+$/.test(strScheme);
        }
        GitHub.matchStr = matchStr;
        function parse(strScheme
        // KSXGitHub/simple-js-yaml-port-for-deno or
        // github:KSXGitHub/simple-js-yaml-port-for-deno or
        // KSXGitHub/simple-js-yaml-port-for-deno#3.12.1 or
        // github:KSXGitHub/simple-js-yaml-port-for-deno#3.12.1 or
        ) {
            const match = strScheme
                .match(/^(?:github:\s*)?([^\/]*)\/([^\/]+)$/i);
            const [repositoryName, branch] = match[2].split("#");
            return {
                "type": "github",
                "userOrOrg": match[1],
                repositoryName,
                branch
            };
        }
        GitHub.parse = parse;
        function buildUrl(scheme, params) {
            var _a, _b, _c;
            return urlJoin_1.urlJoin("https://raw.github.com", scheme.userOrOrg, scheme.repositoryName, (_b = (_a = params.branch) !== null && _a !== void 0 ? _a : scheme.branch) !== null && _b !== void 0 ? _b : "master", (_c = params.pathToFile) !== null && _c !== void 0 ? _c : "mod.ts");
        }
        GitHub.buildUrl = buildUrl;
    })(GitHub = Scheme.GitHub || (Scheme.GitHub = {}));
    let Url;
    (function (Url) {
        let GitHub;
        (function (GitHub) {
            function matchStr(strScheme) {
                return /^https?:\/\/raw\.github(?:usercontent)?\.com/.test(strScheme);
            }
            GitHub.matchStr = matchStr;
            function parse(strScheme) {
                const match = strScheme.match(/^(https?:\/\/raw\.github(?:usercontent)?\.com\/[^\/]+\/[^\/]+\/)([^\/]+)\/(.*)$/);
                return {
                    "type": "url",
                    "urlType": "github",
                    "baseUrlWithoutBranch": match[1]
                        .replace(/^https?:\/\/raw\.github(?:usercontent)?/, "https://raw.github.com"),
                    "branch": match[2],
                    "pathToIndex": match[3]
                };
            }
            GitHub.parse = parse;
        })(GitHub = Url.GitHub || (Url.GitHub = {}));
        let DenoLand;
        (function (DenoLand) {
            function matchStr(strScheme) {
                return /^https?:\/\/deno\.land\/(?:(?:std)|(?:x))[\/|@]/.test(strScheme);
            }
            DenoLand.matchStr = matchStr;
            function parse(strScheme) {
                const match = /^https?:\/\/deno\.land\/std/.test(strScheme) ?
                    strScheme.match(/^(https?:\/\/deno\.land\/std)([@\/].*)$/) :
                    strScheme.match(/^(https?:\/\/deno\.land\/x\/[^@\/]+)([@\/].*)$/);
                // https://deno.land/std@master/node/querystring.ts
                // [1]: https://deno.land/std
                // [2]: @master/node/querystring.ts
                // https://deno.land/std/node/querystring.ts
                // [1]: https://deno.land/std
                // [2]: /node/querystring.ts
                //https://deno.land/x/foo@1.2.3/mod.js
                // [1]: https://deno.land/x/foo
                // [2]: @1.2.3/mod.js
                //https://deno.land/x/foo/mod.js
                // [1]: https://deno.land/x/foo
                // [2]: /mod.js
                const { branch, pathToIndex } = match[2].startsWith("@") ? (() => {
                    const [, branch, // 1.2.3
                    pathToIndex // mod.js
                    ] = match[2].match(/^@([^\/]+)\/(.*)$/);
                    return { branch, pathToIndex };
                })() : ({
                    "branch": undefined,
                    "pathToIndex": match[2].replace(/^\//, "") // mod.js
                });
                return {
                    "type": "url",
                    "urlType": "deno.land",
                    "baseUrlWithoutBranch": match[1],
                    branch,
                    pathToIndex
                };
            }
            DenoLand.parse = parse;
        })(DenoLand = Url.DenoLand || (Url.DenoLand = {}));
        function matchStr(strScheme) {
            return (GitHub.matchStr(strScheme) ||
                DenoLand.matchStr(strScheme));
        }
        Url.matchStr = matchStr;
        function parse(strScheme) {
            if (GitHub.matchStr(strScheme)) {
                return GitHub.parse(strScheme);
            }
            if (DenoLand.matchStr(strScheme)) {
                return DenoLand.parse(strScheme);
            }
            throw new Error(`${strScheme} scheme not supported`);
        }
        Url.parse = parse;
        function buildUrl(scheme, params) {
            var _a, _b;
            const branch = (_a = params.branch) !== null && _a !== void 0 ? _a : scheme.branch;
            return urlJoin_1.urlJoin([
                scheme.baseUrlWithoutBranch.replace(/\/$/, ""),
                !!branch ? `@${branch}` : ""
            ].join(""), (_b = params.pathToFile) !== null && _b !== void 0 ? _b : scheme.pathToIndex);
        }
        Url.buildUrl = buildUrl;
    })(Url = Scheme.Url || (Scheme.Url = {}));
    function parse(strScheme) {
        if (GitHub.matchStr(strScheme)) {
            return GitHub.parse(strScheme);
        }
        if (Url.matchStr(strScheme)) {
            return Url.parse(strScheme);
        }
        throw new Error(`${strScheme} scheme not supported by Denoify`);
    }
    Scheme.parse = parse;
    function buildUrl(scheme, params) {
        switch (scheme.type) {
            case "github": return GitHub.buildUrl(scheme, params);
            case "url": return Url.buildUrl(scheme, params);
        }
    }
    Scheme.buildUrl = buildUrl;
    async function resolveVersion(scheme, params) {
        const { version } = params;
        const urls404 = [];
        for (const branch of [
            ...["v", ""].map(prefix => `${prefix}${version}`),
            "latest",
            ...(!!scheme.branch ? [scheme.branch] : []),
            undefined
        ]) {
            const url = buildUrl(scheme, { branch });
            if (await is404_1.is404(url)) {
                urls404.push(url);
                continue;
            }
            const warning = ((branch !== null && branch !== void 0 ? branch : "").search(version) < 0) ? [
                `WARNING: Specific version ${version} could not be found\n`,
                ...urls404.map(url => `GET ${url} 404\n`),
                `Falling back to ${branch !== null && branch !== void 0 ? branch : "master"} branch\n`,
                `This mean that the Node and the Deno distribution of your module `,
                `will not run the same version of this dependency.`,
            ].join("") : undefined;
            const schemeOut = Object.assign(Object.assign({}, scheme), (!!branch ? { branch } : {}));
            return { "scheme": schemeOut, warning };
        }
        throw new Error(`Can't connect to ${JSON.stringify(scheme)}`);
    }
    Scheme.resolveVersion = resolveVersion;
})(Scheme = exports.Scheme || (exports.Scheme = {}));
