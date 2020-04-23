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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var is404_1 = require("../tools/is404");
var urlJoin_1 = require("../tools/urlJoin");
var Scheme;
(function (Scheme) {
    var GitHub;
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
            var match = strScheme
                .match(/^(?:github:\s*)?([^\/]*)\/([^\/]+)$/i);
            var _a = match[2].split("#"), repositoryName = _a[0], branch = _a[1];
            return {
                "type": "github",
                "userOrOrg": match[1],
                repositoryName: repositoryName,
                branch: branch
            };
        }
        GitHub.parse = parse;
        function buildUrl(scheme, params) {
            var _a, _b, _c;
            return urlJoin_1.urlJoin("https://raw.github.com", scheme.userOrOrg, scheme.repositoryName, (_b = (_a = params.branch) !== null && _a !== void 0 ? _a : scheme.branch) !== null && _b !== void 0 ? _b : "master", (_c = params.pathToFile) !== null && _c !== void 0 ? _c : "mod.ts");
        }
        GitHub.buildUrl = buildUrl;
    })(GitHub = Scheme.GitHub || (Scheme.GitHub = {}));
    var Url;
    (function (Url) {
        var GitHub;
        (function (GitHub) {
            function matchStr(strScheme) {
                return /^https?:\/\/raw\.github(?:usercontent)?\.com/.test(strScheme);
            }
            GitHub.matchStr = matchStr;
            function parse(strScheme) {
                var match = strScheme.match(/^(https?:\/\/raw\.github(?:usercontent)?\.com\/[^\/]+\/[^\/]+\/)([^\/]+)\/(.*)$/);
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
        var DenoLand;
        (function (DenoLand) {
            function matchStr(strScheme) {
                return /^https?:\/\/deno\.land\/(?:(?:std)|(?:x))\//.test(strScheme);
            }
            DenoLand.matchStr = matchStr;
            function parse(strScheme) {
                var match = /^https?:\/\/deno\.land\/std\//.test(strScheme) ?
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
                var _a = match[2].startsWith("@") ? (function () {
                    var _a = match[2].match(/^@([^\/]+)\/(.*)$/), branch = _a[1], // 1.2.3
                    pathToIndex = _a[2] // mod.js
                    ;
                    return { branch: branch, pathToIndex: pathToIndex };
                })() : ({
                    "branch": undefined,
                    "pathToIndex": match[2].replace(/^\//, "") // mod.js
                }), branch = _a.branch, pathToIndex = _a.pathToIndex;
                return {
                    "type": "url",
                    "urlType": "deno.land",
                    "baseUrlWithoutBranch": match[1],
                    branch: branch,
                    pathToIndex: pathToIndex
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
            throw new Error(strScheme + " scheme not supported");
        }
        Url.parse = parse;
        function buildUrl(scheme, params) {
            var _a, _b;
            var branch = (_a = params.branch) !== null && _a !== void 0 ? _a : scheme.branch;
            return urlJoin_1.urlJoin([
                scheme.baseUrlWithoutBranch.replace(/\/$/, ""),
                !!branch ? "@" + branch : ""
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
        throw new Error(strScheme + " scheme not supported");
    }
    Scheme.parse = parse;
    function buildUrl(scheme, params) {
        switch (scheme.type) {
            case "github": return GitHub.buildUrl(scheme, params);
            case "url": return Url.buildUrl(scheme, params);
        }
    }
    Scheme.buildUrl = buildUrl;
    function resolveVersion(scheme, params) {
        return __awaiter(this, void 0, void 0, function () {
            var version, urls404, _i, _a, branch, url, warning, schemeOut;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        version = params.version;
                        urls404 = [];
                        _i = 0, _a = __spreadArrays(["v", ""].map(function (prefix) { return "" + prefix + version; }), [
                            "latest"
                        ], (!!scheme.branch ? [scheme.branch] : []), [
                            undefined
                        ]);
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        branch = _a[_i];
                        url = buildUrl(scheme, { branch: branch });
                        return [4 /*yield*/, is404_1.is404(url)];
                    case 2:
                        if (_b.sent()) {
                            urls404.push(url);
                            return [3 /*break*/, 3];
                        }
                        warning = ((branch !== null && branch !== void 0 ? branch : "").search(version) < 0) ? __spreadArrays([
                            "WARNING: Specific version " + version + " could not be found\n"
                        ], urls404.map(function (url) { return "GET " + url + " 404\n"; }), [
                            "Falling back to " + (branch !== null && branch !== void 0 ? branch : "master") + " branch\n",
                            "This mean that the Node and the Deno distribution of your module ",
                            "will not run the same version of this dependency.",
                        ]).join("") : undefined;
                        schemeOut = __assign(__assign({}, scheme), (!!branch ? { branch: branch } : {}));
                        return [2 /*return*/, { "scheme": schemeOut, warning: warning }];
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: throw new Error("Can't connect to " + JSON.stringify(scheme));
                }
            });
        });
    }
    Scheme.resolveVersion = resolveVersion;
})(Scheme = exports.Scheme || (exports.Scheme = {}));
