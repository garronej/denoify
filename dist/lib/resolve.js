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
Object.defineProperty(exports, "__esModule", { value: true });
var st = require("scripting-tools");
var path = require("path");
var is404_1 = require("../tools/is404");
var urlJoin_1 = require("../tools/urlJoin");
var node_fetch_1 = require("node-fetch");
var commentJson = require("comment-json");
var id_1 = require("../tools/id");
function resolveFactory(params) {
    var _this = this;
    var denoPorts = params.denoPorts;
    var allDependencies = __assign(__assign({}, params.dependencies), params.devDependencies);
    var devDependenciesNames = Object.keys(params.devDependencies);
    var getTargetModulePath = function (nodeModuleName) {
        return st.find_module_path(nodeModuleName, params.projectPath);
    };
    var resolve = function (params) { return __awaiter(_this, void 0, void 0, function () {
        function onUnmetDevDependencyOrError(nodeModuleName, errorMessage) {
            //TODO: factorize
            if (devDependenciesNames.includes(nodeModuleName)) {
                return {
                    "type": "UNMET",
                    "kind": "DEV DEPENDENCY"
                };
            }
            throw new Error(errorMessage);
        }
        var nodeModuleName, url, targetModulePath, packageJsonParsed, getBaseUrlParams, baseUrl, hasBeenDenoified, _a, _b, _c, _d;
        var _this = this;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    nodeModuleName = params.nodeModuleName;
                    {
                        url = denoPorts[nodeModuleName];
                        if (url !== undefined) {
                            return [2 /*return*/, {
                                    "type": "PORT",
                                    url: url
                                }];
                        }
                    }
                    if (!(nodeModuleName in allDependencies)) {
                        return [2 /*return*/, {
                                "type": "UNMET",
                                "kind": "STANDARD"
                            }];
                    }
                    targetModulePath = getTargetModulePath(nodeModuleName);
                    packageJsonParsed = require(path.join(targetModulePath, "package.json"));
                    getBaseUrlParams = (function () {
                        var _a;
                        {
                            var matchedArray = allDependencies[nodeModuleName]
                                .match(/^(?:github:\s*)?([^\/]*)\/([^\/]+)$/i);
                            if (!!matchedArray) {
                                var _b = matchedArray[2].split("#"), repositoryName_1 = _b[0], branch = _b[1];
                                return id_1.id([
                                    {
                                        "branch": branch !== null && branch !== void 0 ? branch : "master",
                                        "userOrOrg": matchedArray[1],
                                        repositoryName: repositoryName_1
                                    }
                                ]);
                            }
                        }
                        var repositoryUrl = (_a = packageJsonParsed === null || packageJsonParsed === void 0 ? void 0 : packageJsonParsed["repository"]) === null || _a === void 0 ? void 0 : _a["url"];
                        if (!repositoryUrl) {
                            return undefined;
                        }
                        var _c = repositoryUrl
                            .replace(/\.git$/i, "")
                            .split("/")
                            .filter(function (s) { return !!s; })
                            .reverse(), repositoryName = _c[0], userOrOrg = _c[1];
                        if (!repositoryName || !userOrOrg) {
                            return undefined;
                        }
                        return ["v", ""].map(function (prefix) { return ({
                            "branch": "" + prefix + packageJsonParsed["version"],
                            userOrOrg: userOrOrg,
                            repositoryName: repositoryName
                        }); });
                    })();
                    if (!getBaseUrlParams) {
                        return [2 /*return*/, onUnmetDevDependencyOrError(nodeModuleName, "Can't find the " + nodeModuleName + " github repository")];
                    }
                    return [4 /*yield*/, Promise.all(getBaseUrlParams.map(getBaseUrl))];
                case 1:
                    baseUrl = (_e.sent())
                        .find(function (baseUrl) { return !!baseUrl; });
                    if (!baseUrl) {
                        return [2 /*return*/, onUnmetDevDependencyOrError(nodeModuleName, nodeModuleName + " v" + packageJsonParsed["version"] + " do not have a github release")];
                    }
                    return [4 /*yield*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                            var modTsRaw, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, node_fetch_1.default(urlJoin_1.urlJoin(baseUrl, "mod.ts"))
                                                .then(function (res) { return res.text(); })];
                                    case 1:
                                        modTsRaw = _b.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        _a = _b.sent();
                                        return [2 /*return*/, false];
                                    case 3:
                                        if (!modTsRaw.match(/denoify/i)) {
                                            return [2 /*return*/, false];
                                        }
                                        return [2 /*return*/, true];
                                }
                            });
                        }); })()];
                case 2:
                    hasBeenDenoified = _e.sent();
                    if (!hasBeenDenoified) {
                        return [2 /*return*/, onUnmetDevDependencyOrError(nodeModuleName, nodeModuleName + " do not seems to have been denoified")];
                    }
                    _a = {
                        "type": "CROSS COMPATIBLE",
                        baseUrl: baseUrl
                    };
                    _b = "tsconfigOutDir";
                    _d = (_c = commentJson).parse;
                    return [4 /*yield*/, node_fetch_1.default(urlJoin_1.urlJoin(baseUrl, "tsconfig.json"))
                            .then(function (res) { return res.text(); })];
                case 3: return [2 /*return*/, (_a[_b] = _d.apply(_c, [_e.sent()])["compilerOptions"]["outDir"],
                        _a)];
            }
        });
    }); };
    return { resolve: resolve };
}
exports.resolveFactory = resolveFactory;
//https://raw.githubusercontent.com/garronej/run_exclusive/v2.1.11/package.json
function getBaseUrl(params) {
    return __awaiter(this, void 0, void 0, function () {
        var branch, userOrOrg, repositoryName, url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    branch = params.branch, userOrOrg = params.userOrOrg, repositoryName = params.repositoryName;
                    url = [
                        "https://raw.githubusercontent.com",
                        userOrOrg,
                        repositoryName,
                        branch
                    ].join("/");
                    return [4 /*yield*/, is404_1.is404(urlJoin_1.urlJoin(url, "mod.ts"))];
                case 1:
                    if (_a.sent()) {
                        return [2 /*return*/, undefined];
                    }
                    return [2 /*return*/, url];
            }
        });
    });
}
