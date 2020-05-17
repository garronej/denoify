"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveFactory = void 0;
var st = require("scripting-tools");
var path = require("path");
var typeSafety_1 = require("evt/dist/tools/typeSafety");
var Scheme_1 = require("./Scheme");
var getTsconfigOutDirIfDenoified_1 = require("./getTsconfigOutDirIfDenoified");
var commentJson = require("comment-json");
var getProjectRoot_1 = require("../tools/getProjectRoot");
var fs = require("fs");
var knownPorts = (function () {
    var _a = commentJson.parse(fs.readFileSync(path.join(getProjectRoot_1.getProjectRoot(), "knownPorts.jsonc")).toString("utf8")), third_party = _a.third_party, builtins = _a.builtins;
    return __assign(__assign({}, third_party), builtins);
})();
/**
 *
 * Example 1:
 *
 * Context:
 * - package.json "dependencies" has an entry { "js-yaml": "~3.12.0" }
 * - There is no entry "js-yaml" in package.json "denoPorts"
 * - The version field in "./node_modules/js-yaml/package.json" is "3.12.1"
 *
 * Resolve is called with:
 * nodeModuleName: "js-yaml"
 *
 * ->
 *
 * The resolution goes as follow:
 * - The entry "js-yaml" in package.json is not a "github:xxx" scheme. Skip
 * - We use "./node_modules/js-yaml/package.json" repository field to lookup
 *   the github repo hosting the module: KSXGitHub/simple-js-yaml-port-for-deno.
 *   We found out that it is not a denoified module ( there is not a "./mod.ts" file
 *   containing the work "denoify"). Skip
 * - There is no entry "js-yaml" in package.json "denoPorts". Skip
 * - There is an entry { "js-yaml": "https://deno.land/x/js_yaml_port/js-yaml.js" }
 *   in knownPort.json, GET https://deno.land/x/js_yaml_port@3.12.1/js-yaml.js is not a 404. Done
 *
 * {
 * "type": "HANDMADE PORT",
 * "scheme": {
 *     "type": "url",
 *     "urlType": "deno.land",
 *     "baseUrlWithoutBranch": "https://deno.land/x/js_yaml_port",
 *     "branch": "3.12.1",
 *     "pathToIndex": "js-yaml.js"
 * }
 * }
 *
 *
 * If the version field in "./node_modules/js-yaml/package.json" was "3.12.2"
 * as GET https://deno.land/x/js_yaml_port@3.12.2/js-yaml.js gives a 404
 * ( KSXGitHub/simple-js-yaml-port-for-deno as no "v3.12.2" or "3.12.2" branch )
 * the result would have been the same without the "branch" property in the "scheme" and
 * a warning would have been printed to the console.
 *
 * Example 2:
 *
 * Context:
 * - package.json "dependencies" has no entry for "fs"
 * - There is no entry "fs" in package.json "denoPorts"
 *
 * Resolve is called with:
 * nodeModuleName: "fs"
 *
 * ->
 *
 * The resolution goes as follow:
 * - "fs" is not present in "dependencies" nor "devDependencies" of package.json, assuming node builtin.
 * - There is no entry for "fs" in package.json "denoPorts". Skip
 * - There is an entry { "fs": "https://deno.land/std/node/fs.ts" } in known port. Done
 *
 * {
 * "type": "HANDMADE PORT",
 * "scheme": {
 *     "type": "url",
 *     "urlType": "deno.land",
 *     "baseUrlWithoutBranch": "https://deno.land/std",
 *     "pathToIndex": "node/fs.ts"
 * }
 * }
 *
 * Example 3:
 *
 * Context:
 * - package.json "dependencies" has an entry { "ts-md5": "~1.2.7" }
 * - There is no entry "ts-md5" in package.json "denoPorts"
 * - The version field in "./node_modules/js-yaml/package.json" is "1.2.7"
 *
 * Resolve is called with:
 * nodeModuleName: "ts-md5"
 *
 * ->
 *
 * The resolution goes as follow:
 * - The entry "js-yaml" in package.json is not a "github:xxx" scheme. Skip
 * - We use "./node_modules/ts-md5/package.json" repository field to lookup
 *   the github repo hosting the module: cotag/ts-md5.
 *   We found out that it is not a denoified module. Skip
 * - There is no entry "ts-md5" in package.json "denoPorts". Skip
 * - There is an entry { "ts-md5": "garronej/ts-md5" }
 *   in knownPort.json, GET https://raw.github.com/garronej/ts-md5/v1.2.7/mod.ts is not a 404
 *   and contain the word denoify. Done
 *
 * We lookup the "outDir" in https://raw.github.com/garronej/ts-md5/v1.2.7/tsconfig.json,
 * we need it so import "ts-md5/dist/md5_worker" can be replaced by "ts-md5/deno_dist/md5_worker.ts" later on.
 *
 * {
 * "type": "DENOIFIED MODULE",
 * "scheme": {
 *     "type": "github",
 *     "userOrOrg": "garronej",
 *     "repositoryName": "ts-md5",
 *     "branch": "v1.2.7"
 * },
 * "tsconfigOutDir": "dist"
 * }
 *
 * Example 4:
 *
 * Context:
 * - package.json "dependencies" has an entry { "ts-md5": "garronej/ts-md5#1.2.7" }
 *
 * Resolve is called with:
 * nodeModuleName: "ts-md5"
 *
 * ->
 *
 * The resolution goes as follow:
 * - The entry "js-yaml" in package.json ("garronej/ts-md5") is a "github:xxx" scheme.
 *   GET https://raw.github.com/garronej/ts-md5/v1.2.7/mod.ts is not a 404 and the file
 *   contains the word "denoify". Done
 *
 * We lookup the "outDir" in https://raw.github.com/garronej/ts-md5/v1.2.7/tsconfig.json,
 *
 * {
 * "type": "DENOIFIED MODULE",
 * "scheme": {
 *     "type": "github",
 *     "userOrOrg": "garronej",
 *     "repositoryName": "ts-md5",
 *     "branch": "v1.2.7"
 * },
 * "tsconfigOutDir": "dist"
 * }
 *
 * Example 5:
 *
 * Context:
 * - package.json "dependencies" has an entry { "run-exclusive": "^2.1.0" }
 * - The version field in "./node_modules/run-exclusive/package.json" is "2.1.12".
 *
 * Resolve is called with:
 * nodeModuleName: "run-exclusive"
 *
 * ->
 *
 * The resolution goes as follow:
 * - The entry "run-exclusive" in package.json is not a "github:xxx" scheme. Skip
 * - We use "./node_modules/ts-md5/package.json" repository field to lookup
 *   the github repo hosting the module: garronej/run-exclusive.
 *   https://raw.github.com/garronej/ts-md5/v2.1.12/mod.ts is not a 404
 *   and contain the word "denoify". Done
 *
 * We lookup the "outDir" in https://raw.github.com/garronej/run-exclusive/v2.1.12/tsconfig.json,
 *
 * {
 * "type": "DENOIFIED MODULE",
 * "scheme": {
 *     "type": "github",
 *     "userOrOrg": "garronej",
 *     "repositoryName": "run-exclusive",
 *     "branch": "v2.1.12"
 * },
 * "tsconfigOutDir": "dist"
 * }
 *
 */
function resolveFactory(params) {
    var log = params.log;
    var denoPorts = (function () {
        var denoPorts = {};
        [knownPorts, params.userProvidedPorts].forEach(function (record) { return Object.keys(record).forEach(function (nodeModuleName) {
            return denoPorts[nodeModuleName] = record[nodeModuleName];
        }); });
        return { denoPorts: denoPorts };
    })().denoPorts;
    var allDependencies = __assign(__assign({}, params.dependencies), params.devDependencies);
    var devDependenciesNames = Object.keys(params.devDependencies);
    var getTargetModulePath = function (nodeModuleName) {
        return st.find_module_path(nodeModuleName, params.projectPath);
    };
    var isInUserProvidedPort = function (nodeModuleName) {
        return nodeModuleName in params.userProvidedPorts;
    };
    function resolve(params) {
        return __awaiter(this, void 0, void 0, function () {
            var nodeModuleName //js-yaml
            , scheme, tsconfigOutDir, targetModulePath, packageJsonParsed, version // 3.13.1 (version installed)
            , wrap, result, _a, scheme, warning;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        nodeModuleName = params.nodeModuleName;
                        if (!!(nodeModuleName in allDependencies)) return [3 /*break*/, 2];
                        if (!(nodeModuleName in denoPorts)) {
                            return [2 /*return*/, {
                                    "type": "NON-FATAL UNMET DEPENDENCY",
                                    "kind": "BUILTIN"
                                }];
                        }
                        scheme = Scheme_1.Scheme.parse(denoPorts[nodeModuleName]);
                        return [4 /*yield*/, getTsconfigOutDirIfDenoified_1.getTsconfigOutDirIfDenoified({ scheme: scheme })];
                    case 1:
                        tsconfigOutDir = (_b.sent()).tsconfigOutDir;
                        return [2 /*return*/, !!tsconfigOutDir ? {
                                "type": "DENOIFIED MODULE",
                                scheme: scheme,
                                tsconfigOutDir: tsconfigOutDir
                            } : {
                                "type": "HANDMADE PORT",
                                scheme: scheme
                            }];
                    case 2:
                        targetModulePath = getTargetModulePath(nodeModuleName);
                        packageJsonParsed = JSON.parse(fs.readFileSync(path.join(targetModulePath, "package.json")).toString("utf8"));
                        version = packageJsonParsed.version;
                        return [4 /*yield*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                                var scheme, tsconfigOutDir;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            try {
                                                scheme = Scheme_1.Scheme.parse(allDependencies[nodeModuleName]);
                                            }
                                            catch (_c) {
                                                // ^1.2.3
                                                return [2 /*return*/, {
                                                        "isSuccess": false,
                                                        "tryRepositoryField": true
                                                    }];
                                            }
                                            return [4 /*yield*/, Scheme_1.Scheme.resolveVersion(scheme, { "version": (_a = scheme.branch) !== null && _a !== void 0 ? _a : "master" })];
                                        case 1:
                                            scheme = (_b.sent()).scheme;
                                            return [4 /*yield*/, getTsconfigOutDirIfDenoified_1.getTsconfigOutDirIfDenoified({ scheme: scheme })];
                                        case 2:
                                            tsconfigOutDir = (_b.sent()).tsconfigOutDir;
                                            if (!tsconfigOutDir) {
                                                return [2 /*return*/, {
                                                        "isSuccess": false,
                                                        "tryRepositoryField": false
                                                    }];
                                            }
                                            return [2 /*return*/, {
                                                    "isSuccess": true,
                                                    "result": typeSafety_1.id({
                                                        "type": "DENOIFIED MODULE",
                                                        scheme: scheme,
                                                        tsconfigOutDir: tsconfigOutDir
                                                    })
                                                }];
                                    }
                                });
                            }); })()];
                    case 3:
                        wrap = _b.sent();
                        if (wrap.isSuccess) {
                            return [2 /*return*/, wrap.result];
                        }
                        return [4 /*yield*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                                var repositoryUrl, _a, repositoryName, userOrOrg, _b, scheme, warning, tsconfigOutDir;
                                var _c;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            if (!wrap.tryRepositoryField) {
                                                return [2 /*return*/, undefined];
                                            }
                                            repositoryUrl = (_c = packageJsonParsed["repository"]) === null || _c === void 0 ? void 0 : _c["url"];
                                            if (!repositoryUrl) {
                                                return [2 /*return*/, undefined];
                                            }
                                            _a = __read(repositoryUrl
                                                .replace(/\.git$/i, "")
                                                .split("/")
                                                .filter(function (s) { return !!s; })
                                                .reverse(), 2), repositoryName = _a[0], userOrOrg = _a[1];
                                            if (!repositoryName || !userOrOrg) {
                                                return [2 /*return*/, undefined];
                                            }
                                            return [4 /*yield*/, Scheme_1.Scheme.resolveVersion(Scheme_1.Scheme.parse("github:" + userOrOrg + "/" + repositoryName), { version: version })];
                                        case 1:
                                            _b = _d.sent(), scheme = _b.scheme, warning = _b.warning;
                                            return [4 /*yield*/, getTsconfigOutDirIfDenoified_1.getTsconfigOutDirIfDenoified({ scheme: scheme })];
                                        case 2:
                                            tsconfigOutDir = (_d.sent()).tsconfigOutDir;
                                            if (!tsconfigOutDir) {
                                                return [2 /*return*/, undefined];
                                            }
                                            if (warning) {
                                                log(warning);
                                            }
                                            return [2 /*return*/, typeSafety_1.id({
                                                    "type": "DENOIFIED MODULE",
                                                    scheme: scheme,
                                                    tsconfigOutDir: tsconfigOutDir
                                                })];
                                    }
                                });
                            }); })()];
                    case 4:
                        result = _b.sent();
                        if (!!result) {
                            if (isInUserProvidedPort(nodeModuleName)) {
                                log("NOTE: " + nodeModuleName + " is a denoified module, there is no need for an entry for in package.json denoPorts");
                            }
                            return [2 /*return*/, result];
                        }
                        if (!(nodeModuleName in denoPorts)) return [3 /*break*/, 6];
                        return [4 /*yield*/, Scheme_1.Scheme.resolveVersion(Scheme_1.Scheme.parse(denoPorts[nodeModuleName]), { version: version })];
                    case 5:
                        _a = _b.sent(), scheme = _a.scheme, warning = _a.warning;
                        if (!!warning) {
                            log(warning);
                        }
                        return [2 /*return*/, {
                                "type": "HANDMADE PORT",
                                scheme: scheme
                            }];
                    case 6:
                        if (devDependenciesNames.includes(nodeModuleName)) {
                            return [2 /*return*/, {
                                    "type": "NON-FATAL UNMET DEPENDENCY",
                                    "kind": "DEV DEPENDENCY"
                                }];
                        }
                        throw new Error("You need to provide a deno port for " + nodeModuleName);
                }
            });
        });
    }
    return { resolve: resolve };
}
exports.resolveFactory = resolveFactory;
//# sourceMappingURL=resolve.js.map