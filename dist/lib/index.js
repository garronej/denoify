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
var denoifySourceCodeString_1 = require("./denoifySourceCodeString");
var transformCodebase_1 = require("./transformCodebase");
var resolve_1 = require("./resolve");
var fs = require("fs");
var path = require("path");
var commentJson = require("comment-json");
function run(_a) {
    var projectPath = _a.projectPath, _b = _a.srcDirPath, srcDirPath = _b === void 0 ? ["src", "lib"]
        .find(function (name) { return fs.existsSync(path.join(projectPath, name)); }) : _b;
    var _c, _d, _e;
    return __awaiter(this, void 0, void 0, function () {
        var packageJsonParsed, denoifySourceCodeString, tsconfigOutDir, denoDistPath;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    packageJsonParsed = require(path.join(projectPath, "package.json"));
                    denoifySourceCodeString = denoifySourceCodeString_1.denoifySourceCodeStringFactory(resolve_1.resolveFactory({
                        projectPath: projectPath,
                        "denoPorts": (_c = packageJsonParsed["denoPorts"]) !== null && _c !== void 0 ? _c : {},
                        "dependencies": (_d = packageJsonParsed["dependencies"]) !== null && _d !== void 0 ? _d : {},
                        "devDependencies": (_e = packageJsonParsed["devDependencies"]) !== null && _e !== void 0 ? _e : {}
                    })).denoifySourceCodeString;
                    tsconfigOutDir = commentJson.parse(fs.readFileSync(path.join(projectPath, "tsconfig.json")).toString("utf8"))["compilerOptions"]["outDir"];
                    denoDistPath = path.join(path.dirname(tsconfigOutDir), "deno_" + path.basename(tsconfigOutDir));
                    return [4 /*yield*/, transformCodebase_1.transformCodebase({
                            "srcDirPath": path.join(projectPath, srcDirPath),
                            "destDirPath": path.join(projectPath, denoDistPath),
                            "transformSourceCodeString": function (_a) {
                                var extension = _a.extension, sourceCode = _a.sourceCode, fileDirPath = _a.fileDirPath;
                                return /^\.?ts$/i.test(extension) || /^\.?js$/i.test(extension) ?
                                    denoifySourceCodeString({ sourceCode: sourceCode, fileDirPath: fileDirPath })
                                    :
                                        Promise.resolve(sourceCode);
                            }
                        })];
                case 1:
                    _f.sent();
                    fs.writeFileSync(path.join(projectPath, "mod.ts"), Buffer.from([
                        "//Automatically generated by denoify.",
                        " It is important not to edit this file.\n",
                        "export * from \"",
                        "./" + path.join(denoDistPath, path.relative(tsconfigOutDir, packageJsonParsed.main // ./dist/lib/index.js
                        ) // ./lib/index.js
                        ) // ./deno_dist/lib/index.js
                            .replace(/\.js$/i, ".ts"),
                        "\";"
                    ].join(""), "utf8"));
                    return [2 /*return*/];
            }
        });
    });
}
exports.run = run;
