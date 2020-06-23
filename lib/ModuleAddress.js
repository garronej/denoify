"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleAddress = void 0;
const is404_1 = require("../tools/is404");
const urlJoin_1 = require("../tools/urlJoin");
const get_github_default_branch_name_1 = require("get-github-default-branch-name");
const denoThirdPartyModuleDb_1 = require("./denoThirdPartyModuleDb");
const node_fetch_1 = require("node-fetch");
const commentJson = require("comment-json");
const path = require("path");
const addCache_1 = require("../tools/addCache");
const getCurrentStdVersion_1 = require("./getCurrentStdVersion");
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
            return /^(?:github:)?[^\/]+\/[^\/]+$/.test(raw);
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
    /**
     * Perform no check, just synchronously assemble the url
     * from a ModuleAddress, a branch and a path to file.
     * */
    function buildUrlFactory(params) {
        const { moduleAddress } = params;
        const buildUrl = (() => {
            switch (moduleAddress.type) {
                case "GITHUB REPO":
                    return (candidateBranch, pathToFile) => urlJoin_1.urlJoin("https://raw.githubusercontent.com", moduleAddress.userOrOrg, moduleAddress.repositoryName, candidateBranch, pathToFile !== null && pathToFile !== void 0 ? pathToFile : "mod.ts");
                case "DENO.LAND URL":
                    return (candidateBranch, pathToFile) => urlJoin_1.urlJoin([
                        moduleAddress.baseUrlWithoutBranch.replace(/\/$/, ""),
                        `@${candidateBranch}`
                    ].join(""), pathToFile !== null && pathToFile !== void 0 ? pathToFile : moduleAddress.pathToIndex);
                case "GITHUB-RAW URL":
                    return (candidateBranch, pathToFile) => urlJoin_1.urlJoin(moduleAddress.baseUrlWithoutBranch.replace(/\/$/, ""), candidateBranch, pathToFile !== null && pathToFile !== void 0 ? pathToFile : moduleAddress.pathToIndex);
            }
        })();
        return { buildUrl };
    }
    async function* candidateBranches(params) {
        const { moduleAddress } = params;
        let fallback = false;
        if (moduleAddress.type === "DENO.LAND URL" && moduleAddress.isStd) {
            yield [await getCurrentStdVersion_1.getCurrentStdVersion(), fallback];
            return undefined;
        }
        if (params.desc === "MATCH VERSION INSTALLED IN NODE_MODULE") {
            const { version } = params;
            yield [version, fallback];
            yield ["v" + version, fallback];
            fallback = { version };
        }
        if (moduleAddress.branch !== undefined) {
            yield [moduleAddress.branch, fallback];
        }
        switch (moduleAddress.type) {
            case "GITHUB REPO":
                walk: {
                    const database = await denoThirdPartyModuleDb_1.getDenoThirdPartyModuleDatabase();
                    const entry = Object.keys(database)
                        .map(moduleName => database[moduleName])
                        .find(({ owner, repo }) => (owner === moduleAddress.userOrOrg &&
                        repo === moduleAddress.repositoryName));
                    if (entry === undefined) {
                        break walk;
                    }
                    yield [entry.default_version, fallback];
                }
                yield ["deno_latest", fallback];
                yield [
                    await get_github_default_branch_name_1.getGithubDefaultBranchName({
                        "owner": moduleAddress.userOrOrg,
                        "repo": moduleAddress.repositoryName
                    }),
                    fallback
                ];
                break;
            case "GITHUB-RAW URL":
                //NOTE: Always a branch specified that should prevail.
                break;
            case "DENO.LAND URL":
                if (moduleAddress.branch !== undefined) {
                    break;
                }
                if (moduleAddress.isStd) {
                    yield [
                        await get_github_default_branch_name_1.getGithubDefaultBranchName({
                            "owner": "denoland",
                            "repo": "deno"
                        }),
                        fallback
                    ];
                }
                else {
                    const default_version = await denoThirdPartyModuleDb_1.getDenoThirdPartyModuleDatabase()
                        .then(database => { var _a; return (_a = database[moduleAddress.baseUrlWithoutBranch.split("/").reverse()[0]]) === null || _a === void 0 ? void 0 : _a.default_version; });
                    if (default_version === undefined) {
                        break;
                    }
                    yield [
                        default_version,
                        fallback
                    ];
                }
                break;
        }
    }
    async function resolveVersion(params) {
        const { buildUrl } = buildUrlFactory({ "moduleAddress": params.moduleAddress });
        for await (const [candidateBranch, fallback] of candidateBranches(params)) {
            const url = buildUrl(candidateBranch);
            if (await is404_1.is404(url)) {
                continue;
            }
            return {
                "branchForVersion": candidateBranch,
                "versionFallbackWarning": !fallback ?
                    undefined :
                    `Can't match ${fallback.version}, falling back to ${candidateBranch} branch`
            };
        }
        return undefined;
    }
    async function isDenoified(params) {
        const { moduleAddress, branchForVersion } = params;
        const { buildUrl } = buildUrlFactory({ moduleAddress });
        let modTsRaw;
        try {
            modTsRaw = await node_fetch_1.default(buildUrl(branchForVersion))
                .then(res => res.text());
        }
        catch (_a) {
            return false;
        }
        if (!modTsRaw.match(/denoify/i)) {
            return false;
        }
        return true;
    }
    /** Asserts denoified module */
    async function getTsconfigOutDir(params) {
        const { branchForVersion, moduleAddress } = params;
        const { buildUrl } = buildUrlFactory({ moduleAddress });
        return path.normalize(commentJson.parse(await node_fetch_1.default(buildUrl(branchForVersion, "tsconfig.json")).then(res => res.text()))["compilerOptions"]["outDir"]);
    }
    ;
    ModuleAddress.getValidImportUrlFactory = addCache_1.addCache(async (params) => {
        const { moduleAddress } = params;
        const { buildUrl } = buildUrlFactory({ moduleAddress });
        const versionResolutionResult = await resolveVersion(params);
        if (versionResolutionResult === undefined) {
            return { "couldConnect": false };
        }
        const { branchForVersion, versionFallbackWarning } = versionResolutionResult;
        const tsconfigOutDir = await (async () => {
            if (!(await isDenoified({ moduleAddress, branchForVersion }))) {
                return undefined;
            }
            return getTsconfigOutDir({ branchForVersion, moduleAddress });
        })();
        const getValidImportUrl = async (params) => {
            if (params.target === "DEFAULT EXPORT") {
                return buildUrl(branchForVersion);
            }
            const { specificImportPath } = params;
            for (const fixedTsConfigOutDir of [
                !tsconfigOutDir ? "dist" : tsconfigOutDir.replace(/\\/g, "/"),
                undefined
            ]) {
                let url = buildUrl(branchForVersion, (fixedTsConfigOutDir === undefined ?
                    specificImportPath
                    :
                        path.posix.join(path.posix.join(path.posix.dirname(fixedTsConfigOutDir), // .
                        `deno_${path.posix.basename(fixedTsConfigOutDir)}` //deno_dist
                        ), // deno_dist
                        path.posix.relative(fixedTsConfigOutDir, specificImportPath // dest/tools/typeSafety
                        ) //  tools/typeSafety
                        ) // deno_dist/tool/typeSafety
                ) + ".ts" // deno_dist/tool/typeSafety.ts
                );
                walk: {
                    if (await is404_1.is404(url)) {
                        break walk;
                    }
                    return url;
                }
                url = url
                    .replace(/\.ts$/, "/index.ts");
                walk: {
                    if (await is404_1.is404(url)) {
                        break walk;
                    }
                    return url;
                }
            }
            throw new Error(`Can't locate ${specificImportPath}`);
        };
        return {
            "couldConnect": true,
            versionFallbackWarning,
            "isDenoified": tsconfigOutDir !== undefined,
            "getValidImportUrl": addCache_1.addCache(getValidImportUrl)
        };
    });
})(ModuleAddress = exports.ModuleAddress || (exports.ModuleAddress = {}));
//# sourceMappingURL=ModuleAddress.js.map