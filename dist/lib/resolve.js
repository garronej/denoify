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
var path = require("path");
function resolveFactory(params) {
    var _this = this;
    var projectPath = params.projectPath, dependenciesPorts = params.dependenciesPorts, devDependencies = params.devDependencies;
    var resolve = function (params) { return __awaiter(_this, void 0, void 0, function () {
        var nodeModuleName, url_1, targetModulePath, url;
        var _a, _b;
        return __generator(this, function (_c) {
            nodeModuleName = params.nodeModuleName;
            {
                url_1 = dependenciesPorts[nodeModuleName];
                if (url_1 !== undefined) {
                    return [2 /*return*/, {
                            "type": "PORT",
                            url: url_1
                        }];
                }
            }
            targetModulePath = st.find_module_path(nodeModuleName, projectPath);
            url = (_b = (_a = require(path.join(targetModulePath, "package.json"))) === null || _a === void 0 ? void 0 : _a["deno"]) === null || _b === void 0 ? void 0 : _b.url;
            if (url === undefined) {
                if (devDependencies.includes(nodeModuleName)) {
                    return [2 /*return*/, { "type": "UNMET DEV DEPENDENCY" }];
                }
                throw new Error("No 'deno' field in " + nodeModuleName + " package.json and no entry in index");
            }
            return [2 /*return*/, {
                    "type": "CROSS COMPATIBLE",
                    url: url,
                    "tsconfigOutDir": require(path.join(projectPath, "tsconfig.json"))
                        .compilerOptions
                        .outDir
                }];
        });
    }); };
    return { resolve: resolve };
}
exports.resolveFactory = resolveFactory;
