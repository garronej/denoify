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
var denoifySingleFile_1 = require("../lib/denoifySingleFile");
var typeSafety_1 = require("evt/dist/tools/typeSafety");
{
    var sourceCode_1 = "\nimport \n\n    * as _ \n\nfrom \n\n\"xxx\"; import * as foobar from \"xxx\" import * as d from \"xxx\";\nconst ok = 3;\nimport { } from \"xxx\";\nimport * as baz from \"xxx\";\nimport * as foo from 'xxx';\nimport type * as foo from 'xxx';\nimport type  { Cat } from 'xxx';\nimport \"xxx\";\n\nconst dd = import(\"xxx\");\nconst dd = import   (   \"xxx\"    );\n\n";
    var str_1 = "foo bar";
    var denoifySingleFile_2 = denoifySingleFile_1.denoifySingleFileFactory({
        "denoifyImportArgument": function (_a) {
            var importArgument = _a.importArgument, fileDirPath = _a.fileDirPath;
            typeSafety_1.assert(fileDirPath === str_1);
            typeSafety_1.assert(importArgument === "xxx");
            return Promise.resolve("yyy");
        }
    }).denoifySingleFile;
    (function () { return __awaiter(void 0, void 0, void 0, function () {
        var modifiedSourceCode;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, denoifySingleFile_2({
                        sourceCode: sourceCode_1,
                        "fileDirPath": str_1
                    })];
                case 1:
                    modifiedSourceCode = _a.sent();
                    typeSafety_1.assert(modifiedSourceCode === sourceCode_1.replace(/xxx/g, "yyy"));
                    console.log("PASS");
                    return [2 /*return*/];
            }
        });
    }); })();
}
{
    var sourceCode_2 = "\nconsole.log(__dirname,__filename);\n";
    var expected_1 = "\nconst __dirname = (()=>{\n    const {url: urlStr}= import.meta;\n    const url= new URL(urlStr);\n    const __filename = url.protocol === \"file:\" ? url.pathname : urlStr;\n    return __filename.replace(/[/][^/]*$/, '');\n})();\n\nconst __filename = (()=>{\n    const {url: urlStr}= import.meta;\n    const url= new URL(urlStr);\n    return url.protocol === \"file:\" ? url.pathname : urlStr;\n})();\n\n\nconsole.log(__dirname,__filename);\n".replace(/^\n/, "");
    var denoifySingleFile_3 = denoifySingleFile_1.denoifySingleFileFactory({
        "denoifyImportArgument": function () { throw new Error("never"); }
    }).denoifySingleFile;
    (function () { return __awaiter(void 0, void 0, void 0, function () {
        var modifiedSourceCode;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, denoifySingleFile_3({
                        sourceCode: sourceCode_2,
                        "fileDirPath": "whatever"
                    })];
                case 1:
                    modifiedSourceCode = _a.sent();
                    typeSafety_1.assert(modifiedSourceCode === expected_1, "message");
                    console.log("PASS");
                    return [2 /*return*/];
            }
        });
    }); })();
}
//# sourceMappingURL=denoifySingleFile.js.map