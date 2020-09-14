"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleAddress = void 0;
var ModuleAddress;
(function (ModuleAddress) {
    let GitHubRepo;
    (function (GitHubRepo) {
        /**
         * Input example
         * KSXGitHub/simple-js-yaml-port-for-deno or
         * github:KSXGitHub/simple-js-yaml-port-for-deno or
         * KSXGitHub/simple-js-yaml-port-for-deno#3.12.1 or
         * github:KSXGitHub/simple-js-yaml-port-for-deno#3.12.1 or
         */
        function parse(raw) {
            const match = raw.match(/^(?:github:\s*)?([^\/]*)\/([^\/]+)$/i);
            const [repositoryName, branch] = match[2].split("#");
            return {
                "type": "GITHUB REPO",
                "userOrOrg": match[1],
                repositoryName,
                branch
            };
        }
        GitHubRepo.parse = parse;
        /** Match valid parse input */
        function match(raw) {
            return /^(?:github:)?[^\/\:]+\/[^\/]+$/.test(raw);
        }
        GitHubRepo.match = match;
    })(GitHubRepo = ModuleAddress.GitHubRepo || (ModuleAddress.GitHubRepo = {}));
    let GitHubRawUrl;
    (function (GitHubRawUrl) {
        function parse(raw) {
            const match = raw.match(/^(https?:\/\/raw\.github(?:usercontent)?\.com\/[^\/]+\/[^\/]+\/)([^\/]+)\/(.*)$/);
            return {
                "type": "GITHUB-RAW URL",
                "baseUrlWithoutBranch": match[1]
                    .replace(/^https?:\/\/raw\.github(?:usercontent)?/, "https://raw.githubusercontent")
                    .replace(/\/$/, ""),
                "branch": match[2],
                "pathToIndex": match[3]
            };
        }
        GitHubRawUrl.parse = parse;
        function match(raw) {
            return /^https?:\/\/raw\.github(?:usercontent)?\.com/.test(raw);
        }
        GitHubRawUrl.match = match;
    })(GitHubRawUrl = ModuleAddress.GitHubRawUrl || (ModuleAddress.GitHubRawUrl = {}));
    let DenoLandUrl;
    (function (DenoLandUrl) {
        function parse(raw) {
            const isStd = /^https?:\/\/deno\.land\/std/.test(raw);
            const match = isStd ?
                raw.match(/^(https?:\/\/deno\.land\/std)([@\/].*)$/) :
                raw.match(/^(https?:\/\/deno\.land\/x\/[^@\/]+)([@\/].*)$/);
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
                "type": "DENO.LAND URL",
                isStd,
                "baseUrlWithoutBranch": match[1],
                "branch": branch,
                pathToIndex
            };
        }
        DenoLandUrl.parse = parse;
        function match(raw) {
            return /^https?:\/\/deno\.land\/(?:(?:std)|(?:x))[\/|@]/.test(raw);
        }
        DenoLandUrl.match = match;
    })(DenoLandUrl = ModuleAddress.DenoLandUrl || (ModuleAddress.DenoLandUrl = {}));
    function parse(raw) {
        for (const ns of [GitHubRepo, GitHubRawUrl, DenoLandUrl]) {
            if (!ns.match(raw)) {
                continue;
            }
            return ns.parse(raw);
        }
        throw new Error(`${raw} is not a valid module address`);
    }
    ModuleAddress.parse = parse;
})(ModuleAddress = exports.ModuleAddress || (exports.ModuleAddress = {}));
//# sourceMappingURL=ModuleAddress.js.map