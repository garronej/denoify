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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.denoifyImportArgumentFactory = void 0;
var path = require("path");
var addCache_1 = require("../tools/addCache");
var Scheme_1 = require("./Scheme");
var fs = require("fs");
var is404_1 = require("../tools/is404");
/**
 * examples:
 * "evt" -> "https://deno.land/x/evt@.../mod.ts"
 * "evt/dist/tools/typeSafety" -> "https://deno.land/x/evt@.../deno_dist/tools/typeSafety/index.ts"
 * "./interfaces" -> "./interfaces/index.ts"
 */
function denoifyImportArgumentFactory(params) {
    var resolve = addCache_1.addCache(params.resolve);
    function denoifyImportArgument(params) {
        return __awaiter(this, void 0, void 0, function () {
            var fileDirPath, importStr, out, _a, nodeModuleName, specificImportPath, resolveResult, out, _b, _c, tsconfigOutDir, out, e_1_1;
            var e_1, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        fileDirPath = params.fileDirPath;
                        importStr = params
                            .importArgument // ./interfaces/
                            .replace(/\/+$/, "/index") // ./interfaces/index
                        ;
                        if (importStr.startsWith(".")) {
                            if (/\.json$/i.test(importStr)) {
                                return [2 /*return*/, importStr];
                            }
                            if (fs.existsSync(path.join(fileDirPath, importStr + ".ts"))) {
                                return [2 /*return*/, importStr + ".ts"];
                            }
                            out = path.join(importStr, "index.ts");
                            return [2 /*return*/, out.startsWith(".") ? out : "./" + out];
                        }
                        _a = (function () {
                            var _a = __read(importStr.split("/")), nodeModuleName = _a[0], rest = _a.slice(1);
                            return {
                                nodeModuleName: nodeModuleName,
                                "specificImportPath": rest.join("/")
                            };
                        })(), nodeModuleName = _a.nodeModuleName, specificImportPath = _a.specificImportPath;
                        return [4 /*yield*/, resolve({ nodeModuleName: nodeModuleName })];
                    case 1:
                        resolveResult = _e.sent();
                        if (resolveResult.type === "NON-FATAL UNMET DEPENDENCY") {
                            return [2 /*return*/, importStr + " DENOIFY: DEPENDENCY UNMET (" + resolveResult.kind + ")"];
                        }
                        if (!!specificImportPath) return [3 /*break*/, 3];
                        out = Scheme_1.Scheme.buildUrl(resolveResult.scheme, {});
                        return [4 /*yield*/, is404_1.is404(out)];
                    case 2:
                        if (_e.sent()) {
                            throw new Error(out + " 404 not found.");
                        }
                        return [2 /*return*/, out];
                    case 3:
                        _e.trys.push([3, 10, 11, 12]);
                        _b = __values([
                            (function () {
                                switch (resolveResult.type) {
                                    case "DENOIFIED MODULE": return resolveResult.tsconfigOutDir;
                                    case "HANDMADE PORT": return "dist";
                                }
                            })(),
                            undefined
                        ]), _c = _b.next();
                        _e.label = 4;
                    case 4:
                        if (!!_c.done) return [3 /*break*/, 9];
                        tsconfigOutDir = _c.value;
                        out = Scheme_1.Scheme.buildUrl(resolveResult.scheme, {
                            "pathToFile": (tsconfigOutDir === undefined ?
                                specificImportPath
                                :
                                    path.join(path.join(path.dirname(tsconfigOutDir), // .
                                    "deno_" + path.basename(tsconfigOutDir) //deno_dist
                                    ), // deno_dist
                                    path.relative(tsconfigOutDir, specificImportPath // dest/tools/typeSafety
                                    ) //  tools/typeSafety
                                    ) // deno_dist/tool/typeSafety
                            ) + ".ts" // deno_dist/tool/typeSafety.ts
                        });
                        return [4 /*yield*/, is404_1.is404(out)];
                    case 5:
                        if (_e.sent()) {
                            return [3 /*break*/, 6];
                        }
                        return [2 /*return*/, out];
                    case 6:
                        out = out
                            .replace(/\.ts$/, "/index.ts");
                        return [4 /*yield*/, is404_1.is404(out)];
                    case 7:
                        if (_e.sent()) {
                            return [3 /*break*/, 8];
                        }
                        return [2 /*return*/, out];
                    case 8:
                        _c = _b.next();
                        return [3 /*break*/, 4];
                    case 9: return [3 /*break*/, 12];
                    case 10:
                        e_1_1 = _e.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 12];
                    case 11:
                        try {
                            if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 12: throw new Error([
                        "Problem resolving " + importStr + " in " + fileDirPath + " with",
                        JSON.stringify(resolveResult.scheme) + " 404 not found."
                    ].join(" "));
                }
            });
        });
    }
    return { denoifyImportArgument: denoifyImportArgument };
}
exports.denoifyImportArgumentFactory = denoifyImportArgumentFactory;
//# sourceMappingURL=denoifyImportArgument.js.map