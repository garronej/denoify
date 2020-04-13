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
var st = require("scripting-tools");
var fs = require("fs");
var path = require("path");
/** List all files in a given directory return paths relative to the dir_path */
var crawl = (function () {
    var crawlRec = function (dir_path, paths) {
        for (var _i = 0, _a = fs.readdirSync(dir_path); _i < _a.length; _i++) {
            var file_name = _a[_i];
            var file_path = path.join(dir_path, file_name);
            var ls_stat = fs.lstatSync(file_path);
            if (ls_stat.isDirectory()) {
                crawlRec(file_path, paths);
                continue;
            }
            paths.push(file_path);
        }
    };
    return function crawl(dir_path) {
        var paths = [];
        crawlRec(dir_path, paths);
        return paths.map(function (file_path) { return path.relative(dir_path, file_path); });
    };
})();
/** Apply a transformation function to every file of directory */
function transformCodebase(params) {
    return __awaiter(this, void 0, void 0, function () {
        var srcDirPath, destDirPath, transformSourceCodeString, _i, _a, file_relative_path, file_path, _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    srcDirPath = params.srcDirPath, destDirPath = params.destDirPath, transformSourceCodeString = params.transformSourceCodeString;
                    _i = 0, _a = crawl(srcDirPath);
                    _g.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    file_relative_path = _a[_i];
                    st.fs_move("COPY", srcDirPath, destDirPath, file_relative_path);
                    file_path = path.join(destDirPath, file_relative_path);
                    _c = (_b = fs).writeFileSync;
                    _d = [file_path];
                    _f = (_e = Buffer).from;
                    return [4 /*yield*/, transformSourceCodeString({
                            "extension": path.extname(file_path).substr(1).toLowerCase(),
                            "sourceCode": fs.readFileSync(file_path).toString("utf8"),
                            "fileDirPath": path.dirname(path.join(srcDirPath, file_relative_path))
                        })];
                case 2:
                    _c.apply(_b, _d.concat([_f.apply(_e, [_g.sent(),
                            "utf8"])]));
                    _g.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.transformCodebase = transformCodebase;
