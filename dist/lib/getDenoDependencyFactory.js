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
Object.defineProperty(exports, "__esModule", { value: true });
const st = require("scripting-tools");
const path = require("path");
function getDenoDependencyFactory(params) {
    const { nodeModuleDirPath, denoDependencies } = params;
    const getDenoDependency = (nodeModuleName) => __awaiter(this, void 0, void 0, function* () {
        {
            const moduleRepo = denoDependencies[nodeModuleName];
            if (moduleRepo !== undefined) {
                return moduleRepo;
            }
        }
        const moduleRepo = require(path.join(st.find_module_path(nodeModuleName, nodeModuleDirPath), "package.json"))["deno"];
        if (moduleRepo === undefined) {
            throw new Error(`No 'deno' field in ${nodeModuleName} package.json and no entry in index`);
        }
        return moduleRepo;
    });
    return { getDenoDependency };
}
exports.getDenoDependencyFactory = getDenoDependencyFactory;
