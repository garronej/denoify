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
exports.denoifySingleFileFactory = void 0;
var replaceAsync_1 = require("../tools/replaceAsync");
function denoifySingleFileFactory(params) {
    var denoifyImportArgument = params.denoifyImportArgument;
    /** Returns source code with deno imports replaced */
    function denoifySingleFile(params) {
        return __awaiter(this, void 0, void 0, function () {
            var fileDirPath, sourceCode, modifiedSourceCode, _loop_1, _a, _b, quoteSymbol, e_1_1;
            var e_1, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        fileDirPath = params.fileDirPath, sourceCode = params.sourceCode;
                        modifiedSourceCode = sourceCode;
                        if (usesBuiltIn("__filename", sourceCode)) {
                            modifiedSourceCode = [
                                "const __filename = (()=>{",
                                "    const {url: urlStr}= import.meta;",
                                "    const url= new URL(urlStr);",
                                "    return url.protocol === \"file:\" ? url.pathname : urlStr;",
                                "})();",
                                '',
                                modifiedSourceCode
                            ].join("\n");
                        }
                        if (usesBuiltIn("__dirname", sourceCode)) {
                            modifiedSourceCode = [
                                "const __dirname = (()=>{",
                                "    const {url: urlStr}= import.meta;",
                                "    const url= new URL(urlStr);",
                                "    const __filename = url.protocol === \"file:\" ? url.pathname : urlStr;",
                                "    return __filename.replace(/[/][^/]*$/, '');",
                                "})();",
                                "",
                                modifiedSourceCode
                            ].join("\n");
                        }
                        _loop_1 = function (quoteSymbol) {
                            var strRegExpInQuote, replacerAsync, _a, _b, regExpStr, e_2_1;
                            var e_2, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        strRegExpInQuote = quoteSymbol + "[^" + quoteSymbol + "]+" + quoteSymbol;
                                        replacerAsync = (function () {
                                            var regExpReplaceInQuote = new RegExp("^([^" + quoteSymbol + "]*" + quoteSymbol + ")([^" + quoteSymbol + "]+)(" + quoteSymbol + "[^" + quoteSymbol + "]*)$", "m");
                                            return function (substring) { return __awaiter(_this, void 0, void 0, function () {
                                                var _a, before, importArgument, after, _b;
                                                return __generator(this, function (_c) {
                                                    switch (_c.label) {
                                                        case 0:
                                                            _a = __read(substring.match(regExpReplaceInQuote), 4), before = _a[1], importArgument = _a[2], after = _a[3];
                                                            _b = "" + before;
                                                            return [4 /*yield*/, denoifyImportArgument({ fileDirPath: fileDirPath, importArgument: importArgument })];
                                                        case 1: return [2 /*return*/, _b + (_c.sent()) + after];
                                                    }
                                                });
                                            }); };
                                        })();
                                        _d.label = 1;
                                    case 1:
                                        _d.trys.push([1, 6, 7, 8]);
                                        _a = (e_2 = void 0, __values([
                                            "export\\s+\\*\\s+from\\s*" + strRegExpInQuote,
                                            "(?:import|export)(?:\\s+type)?\\s*\\*\\s*as\\s+[^\\s]+\\s+from\\s*" + strRegExpInQuote,
                                            "(?:import|export)(?:\\s+type)?\\s*{[^}]*}\\s*from\\s*" + strRegExpInQuote,
                                            "import(?:\\s+type)?\\s+[^\\*{][^\\s]*\\s+from\\s*" + strRegExpInQuote,
                                            "import\\s*" + strRegExpInQuote,
                                            "[^a-zA-Z._0-9$]import\\s*\\(\\s*" + strRegExpInQuote + "\\s*\\)",
                                        ])), _b = _a.next();
                                        _d.label = 2;
                                    case 2:
                                        if (!!_b.done) return [3 /*break*/, 5];
                                        regExpStr = _b.value;
                                        return [4 /*yield*/, replaceAsync_1.replaceAsync(modifiedSourceCode, new RegExp(regExpStr, "mg"), replacerAsync)];
                                    case 3:
                                        modifiedSourceCode = _d.sent();
                                        _d.label = 4;
                                    case 4:
                                        _b = _a.next();
                                        return [3 /*break*/, 2];
                                    case 5: return [3 /*break*/, 8];
                                    case 6:
                                        e_2_1 = _d.sent();
                                        e_2 = { error: e_2_1 };
                                        return [3 /*break*/, 8];
                                    case 7:
                                        try {
                                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                                        }
                                        finally { if (e_2) throw e_2.error; }
                                        return [7 /*endfinally*/];
                                    case 8: return [2 /*return*/];
                                }
                            });
                        };
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 6, 7, 8]);
                        _a = __values(["\"", "'"]), _b = _a.next();
                        _d.label = 2;
                    case 2:
                        if (!!_b.done) return [3 /*break*/, 5];
                        quoteSymbol = _b.value;
                        return [5 /*yield**/, _loop_1(quoteSymbol)];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4:
                        _b = _a.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _d.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/, modifiedSourceCode];
                }
            });
        });
    }
    return { denoifySingleFile: denoifySingleFile };
}
exports.denoifySingleFileFactory = denoifySingleFileFactory;
//TODO: Improve!
function usesBuiltIn(builtIn, sourceCode) {
    return sourceCode.indexOf(builtIn) >= 0;
}
//# sourceMappingURL=denoifySingleFile.js.map