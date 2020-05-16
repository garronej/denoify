"use strict";
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
var resolve_1 = require("../lib/resolve");
var path = require("path");
var inDepth = require("evt/dist/tools/inDepth");
var typeSafety_1 = require("evt/dist/tools/typeSafety");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var std_out_1, resolve, _a, _b, _c, std_out_2, resolve, _d, _e, _f, expected_std_out, std_out_3, resolve, _g, _h, _j, std_out_4, resolve, _k, _l, _m, std_out_5, resolve, _o, _p, _q;
    return __generator(this, function (_r) {
        switch (_r.label) {
            case 0:
                console.log("NOTE: This test require an internet connection");
                std_out_1 = "";
                resolve = resolve_1.resolveFactory({
                    "projectPath": path.join(__dirname, "..", "..", "res", "test_resolve_1"),
                    "dependencies": {
                        "js-yaml": "~3.13.0"
                    },
                    "devDependencies": {},
                    "userProvidedPorts": {},
                    "log": function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        return std_out_1 += args.join(" ");
                    }
                }).resolve;
                _a = typeSafety_1.assert;
                _c = (_b = inDepth).same;
                return [4 /*yield*/, resolve({ "nodeModuleName": "js-yaml" })];
            case 1:
                _a.apply(void 0, [_c.apply(_b, [_r.sent(), {
                            type: 'HANDMADE PORT',
                            scheme: {
                                type: 'url',
                                urlType: 'deno.land',
                                baseUrlWithoutBranch: 'https://deno.land/x/js_yaml_port',
                                branch: '3.13.1',
                                pathToIndex: 'js-yaml.js'
                            }
                        }])]);
                typeSafety_1.assert(std_out_1 === "");
                std_out_2 = "";
                resolve = resolve_1.resolveFactory({
                    "projectPath": path.join(__dirname, "..", "..", "res", "test_resolve_2"),
                    "dependencies": {
                        "js-yaml": "~3.13.0"
                    },
                    "devDependencies": {},
                    "userProvidedPorts": {},
                    "log": function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        return std_out_2 += args.join(" ");
                    }
                }).resolve;
                _d = typeSafety_1.assert;
                _f = (_e = inDepth).same;
                return [4 /*yield*/, resolve({ "nodeModuleName": "js-yaml" })];
            case 2:
                _d.apply(void 0, [_f.apply(_e, [_r.sent(), {
                            type: 'HANDMADE PORT',
                            scheme: {
                                type: 'url',
                                urlType: 'deno.land',
                                baseUrlWithoutBranch: 'https://deno.land/x/js_yaml_port',
                                branch: undefined,
                                pathToIndex: 'js-yaml.js'
                            }
                        }])]);
                expected_std_out = "WARNING: Specific version 3.13.0 could not be found\nGET https://deno.land/x/js_yaml_port@v3.13.0/js-yaml.js 404\nGET https://deno.land/x/js_yaml_port@3.13.0/js-yaml.js 404\nGET https://deno.land/x/js_yaml_port@latest/js-yaml.js 404\nFalling back to master branch\nThis mean that the Node and the Deno distribution of your module will not run the same version of this dependency.";
                typeSafety_1.assert(std_out_2 === expected_std_out);
                std_out_3 = "";
                resolve = resolve_1.resolveFactory({
                    "projectPath": path.join(__dirname, "..", "..", "res", "test_resolve_3"),
                    "dependencies": { "ts-md5": "1.2.7" },
                    "devDependencies": {},
                    "userProvidedPorts": {},
                    "log": function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        return std_out_3 += args.join(" ");
                    }
                }).resolve;
                _g = typeSafety_1.assert;
                _j = (_h = inDepth).same;
                return [4 /*yield*/, resolve({ "nodeModuleName": "ts-md5" })];
            case 3:
                _g.apply(void 0, [_j.apply(_h, [_r.sent(), {
                            type: 'HANDMADE PORT',
                            scheme: {
                                type: 'github',
                                userOrOrg: 'garronej',
                                repositoryName: 'ts-md5',
                                branch: 'v1.2.7'
                            }
                        }])]);
                typeSafety_1.assert(std_out_3 === "");
                std_out_4 = "";
                resolve = resolve_1.resolveFactory({
                    "projectPath": path.join(__dirname, "..", "..", "res", "test_resolve_4"),
                    "dependencies": { "my-dummy-npm-and-deno-module": "0.1.0" },
                    "devDependencies": {},
                    "userProvidedPorts": {},
                    "log": function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        return std_out_4 += args.join(" ");
                    }
                }).resolve;
                _k = typeSafety_1.assert;
                _m = (_l = inDepth).same;
                return [4 /*yield*/, resolve({ "nodeModuleName": "my-dummy-npm-and-deno-module" })];
            case 4:
                _k.apply(void 0, [_m.apply(_l, [_r.sent(), {
                            type: 'DENOIFIED MODULE',
                            scheme: {
                                type: 'github',
                                userOrOrg: 'garronej',
                                repositoryName: 'my_dummy_npm_and_deno_module',
                                branch: "v0.1.0"
                            },
                            tsconfigOutDir: './dist'
                        }])]);
                typeSafety_1.assert(std_out_4 === "");
                std_out_5 = "";
                resolve = resolve_1.resolveFactory({
                    "projectPath": path.join(__dirname, "..", "..", "res", "test_resolve_5"),
                    "dependencies": { "ts-md5": "garronej/ts-md5#1.2.7" },
                    "devDependencies": {},
                    "userProvidedPorts": {},
                    "log": function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        return std_out_5 += args.join(" ");
                    }
                }).resolve;
                _o = typeSafety_1.assert;
                _q = (_p = inDepth).same;
                return [4 /*yield*/, resolve({ "nodeModuleName": "ts-md5" })];
            case 5:
                _o.apply(void 0, [_q.apply(_p, [_r.sent(), {
                            type: 'DENOIFIED MODULE',
                            scheme: {
                                type: 'github',
                                userOrOrg: 'garronej',
                                repositoryName: 'ts-md5',
                                branch: 'v1.2.7'
                            },
                            tsconfigOutDir: './dist'
                        }])]);
                typeSafety_1.assert(std_out_5 === "");
                console.log("PASS");
                return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=resolve.js.map