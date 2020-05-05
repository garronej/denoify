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
var modTsFile_1 = require("../lib/modTsFile");
var pathDepth_1 = require("../tools/pathDepth");
var moveContentUpOneLevel_1 = require("../tools/moveContentUpOneLevel");
var exec_1 = require("../tools/exec");
var getIsDryRun_1 = require("../lib/getIsDryRun");
var removeFromGitignore_1 = require("../tools/removeFromGitignore");
var fs = require("fs");
/**
 * To disable dry run mode  DRY_RUN=1 env variable must be set.
 * This function Change change the working directory.
 * */
function run(params) {
    return __awaiter(this, void 0, void 0, function () {
        var isDryRun, exec, moveContentUpOneLevel, _a, srcDirPath, denoDistPath, tsconfigOutDir, fixedGitignoreRaw;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    isDryRun = getIsDryRun_1.getIsDryRun().isDryRun;
                    exec = exec_1.execFactory({ isDryRun: isDryRun }).exec;
                    moveContentUpOneLevel = moveContentUpOneLevel_1.moveContentUpOneLevelFactory({ isDryRun: isDryRun }).moveContentUpOneLevel;
                    process.chdir(params.pathToTargetModule);
                    _a = modTsFile_1.modTsFile.parseMetadata({ "projectPath": "." }), srcDirPath = _a.srcDirPath, denoDistPath = _a.denoDistPath, tsconfigOutDir = _a.tsconfigOutDir;
                    if (pathDepth_1.pathDepth(tsconfigOutDir) != 1) {
                        throw new Error("tsconfig out dir must be a directory at the root of the project for this script to work");
                    }
                    modTsFile_1.modTsFile.create({
                        "tsFilePath": path.relative(tsconfigOutDir, // ./dist
                        JSON.parse(fs.readFileSync("package.json").toString("utf8")).main // ./dist/lib/index.js
                            .replace(/\.js$/i, ".ts")),
                        "projectPath": ".",
                        isDryRun: isDryRun
                    });
                    return [4 /*yield*/, exec("rm -r " + srcDirPath)];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, exec("rm -r " + tsconfigOutDir)];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, moveContentUpOneLevel({ "dirPath": denoDistPath })];
                case 3:
                    _b.sent();
                    fixedGitignoreRaw = removeFromGitignore_1.removeFromGitignore({
                        "pathToTargetModule": ".",
                        "fileOrDirPathsToAccept": [
                            "./mod.ts",
                            // NOTE: This files must not be included 
                            // but we add them so that dry run and real run be consistent
                            denoDistPath, tsconfigOutDir
                        ]
                    }).fixedGitignoreRaw;
                    if (!fixedGitignoreRaw) {
                        return [2 /*return*/];
                    }
                    console.log("\n" + (isDryRun ? "(dry)" : "") + " .gitignore:\n\n" + fixedGitignoreRaw);
                    if (!isDryRun) {
                        fs.writeFileSync(".gitignore", Buffer.from(fixedGitignoreRaw, "utf8"));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    run({ "pathToTargetModule": "." });
}
