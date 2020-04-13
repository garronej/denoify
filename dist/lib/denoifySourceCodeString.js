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
var path = require("path");
var addCache_1 = require("../tools/addCache");
var replaceAsync_1 = require("../tools/replaceAsync");
var fs = require("fs");
var node_fetch_1 = require("node-fetch");
var urlJoin = require("url-join");
function commonJsImportStringToDenoImportStringFactory(params) {
    var resolve = addCache_1.addCache(params.resolve);
    function commonJsImportStringToDenoImportString(params) {
        return __awaiter(this, void 0, void 0, function () {
            var fileDirPath, importStr, out_1, _a, nodeModuleName, rest, resolveResult, url, tsconfigOutDir, out, is404;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fileDirPath = params.fileDirPath;
                        importStr = params
                            .importStr // ./interfaces/
                            .replace(/\/+$/, "/index") // ./interfaces/index
                        ;
                        if (importStr.startsWith(".")) {
                            if (/\.json$/i.test(importStr)) {
                                return [2 /*return*/, importStr];
                            }
                            if (fs.existsSync(path.join(fileDirPath, importStr + ".ts"))) {
                                return [2 /*return*/, importStr + ".ts"];
                            }
                            out_1 = path.join(importStr, "index.ts");
                            return [2 /*return*/, out_1.startsWith(".") ? out_1 : "./" + out_1];
                        }
                        _a = importStr.split("/"), nodeModuleName = _a[0], rest = _a.slice(1);
                        return [4 /*yield*/, resolve({ nodeModuleName: nodeModuleName })];
                    case 1:
                        resolveResult = _b.sent();
                        if (resolveResult.type === "UNMET DEV DEPENDENCY") {
                            return [2 /*return*/, importStr + " (unmet dev dependency)"];
                        }
                        if (resolveResult.type === "PORT") {
                            //TODO: crawl
                            if (rest.length !== 0) {
                                throw new Error("Error with: " + importStr + " Port support ony default import");
                            }
                            return [2 /*return*/, resolveResult.url];
                        }
                        url = resolveResult.url, tsconfigOutDir = resolveResult.tsconfigOutDir;
                        if (rest.length === 0) {
                            return [2 /*return*/, url];
                        }
                        out = urlJoin(url.match(/^(.*\/)[^\/]+$/)[1], // https://deno.land/x/evt/
                        path.join(path.join(path.dirname(tsconfigOutDir), "deno_" + path.basename(tsconfigOutDir)), // deno_dist
                        path.relative(tsconfigOutDir, path.join.apply(path, rest)) //  tools/typeSafety
                        ) // deno_dist/tool/typeSafety
                            + ".ts" // deno_dist/tool/typeSafety.ts
                        ) // https://deno.land/x/event_emitter/deno_dist/tool/typeSafety.ts
                        ;
                        return [4 /*yield*/, node_fetch_1.default(out)
                                .then(function (_a) {
                                var status = _a.status;
                                return status === 404;
                            })];
                    case 2:
                        is404 = _b.sent();
                        if (is404) {
                            return [2 /*return*/, out
                                    .replace(/\.ts$/, "/index.ts")
                                // https://deno.land/x/event_emitter/deno_dist/tool/typeSafety/index.ts
                            ];
                        }
                        return [2 /*return*/, out];
                }
            });
        });
    }
    return { commonJsImportStringToDenoImportString: commonJsImportStringToDenoImportString };
}
function denoifySourceCodeStringFactory(params) {
    var commonJsImportStringToDenoImportString = commonJsImportStringToDenoImportStringFactory(params).commonJsImportStringToDenoImportString;
    /** Returns source code with deno imports replaced */
    function denoifySourceCodeString(params) {
        return __awaiter(this, void 0, void 0, function () {
            var fileDirPath, sourceCode, out, _loop_1, _i, _a, quoteSymbol;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fileDirPath = params.fileDirPath, sourceCode = params.sourceCode;
                        out = sourceCode;
                        _loop_1 = function (quoteSymbol) {
                            var strRegExpInQuote, replacerAsync, _i, _a, regExpStr;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        strRegExpInQuote = quoteSymbol + "[^" + quoteSymbol + "]+" + quoteSymbol;
                                        replacerAsync = (function () {
                                            var regExpReplaceInQuote = new RegExp("^([^" + quoteSymbol + "]*" + quoteSymbol + ")([^" + quoteSymbol + "]+)(" + quoteSymbol + "[^" + quoteSymbol + "]*)$", "m");
                                            return function (substring) { return __awaiter(_this, void 0, void 0, function () {
                                                var _a, before, importStr, after, _b;
                                                return __generator(this, function (_c) {
                                                    switch (_c.label) {
                                                        case 0:
                                                            _a = substring.match(regExpReplaceInQuote), before = _a[1], importStr = _a[2], after = _a[3];
                                                            _b = "" + before;
                                                            return [4 /*yield*/, commonJsImportStringToDenoImportString({ fileDirPath: fileDirPath, importStr: importStr })];
                                                        case 1: return [2 /*return*/, _b + (_c.sent()) + after];
                                                    }
                                                });
                                            }); };
                                        })();
                                        _i = 0, _a = [
                                            "export\\s+\\*\\s+from\\s*" + strRegExpInQuote,
                                            "(?:import|export)(?:\\s+type)?\\s*\\*\\s*as\\s+[^\\s]+\\s+from\\s*" + strRegExpInQuote,
                                            "(?:import|export)(?:\\s+type)?\\s*{[^}]*}\\s*from\\s*" + strRegExpInQuote,
                                            "import(?:\\s+type)?\\s+[^\\*{][^\\s]*\\s+from\\s*" + strRegExpInQuote,
                                            "import\\s*" + strRegExpInQuote,
                                            "[^a-zA-Z._0-9$]import\\s*\\(\\s*" + strRegExpInQuote + "\\s*\\)",
                                        ];
                                        _b.label = 1;
                                    case 1:
                                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                                        regExpStr = _a[_i];
                                        return [4 /*yield*/, replaceAsync_1.replaceAsync(out, new RegExp(regExpStr, "mg"), replacerAsync)];
                                    case 2:
                                        out = _b.sent();
                                        _b.label = 3;
                                    case 3:
                                        _i++;
                                        return [3 /*break*/, 1];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, _a = ["\"", "'"];
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        quoteSymbol = _a[_i];
                        return [5 /*yield**/, _loop_1(quoteSymbol)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, out];
                }
            });
        });
    }
    return { denoifySourceCodeString: denoifySourceCodeString };
}
exports.denoifySourceCodeStringFactory = denoifySourceCodeStringFactory;
