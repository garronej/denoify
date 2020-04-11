"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const st = require("scripting-tools");
const path = require("path");
function getDenoDependencyFactory(params) {
    const { nodeModuleDirPath, denoDependencies } = params;
    const getDenoDependency = async (nodeModuleName) => {
        {
            const moduleRepo = denoDependencies[nodeModuleName];
            if (moduleRepo !== undefined) {
                return moduleRepo;
            }
        }
        const packageJsonParsed = require(path.join(st.find_module_path(nodeModuleName, nodeModuleDirPath), "package.json"));
        const denoifyKey = "deno";
        if (!(denoifyKey in packageJsonParsed)) {
            throw new Error(`No 'deno' field in ${nodeModuleName} package.json and no entry in index`);
        }
        return {
            "url": packageJsonParsed[denoifyKey].url,
            "main": packageJsonParsed[denoifyKey].main ??
                packageJsonParsed.main.replace(/\.js$/i, ".ts")
        };
    };
    return { getDenoDependency };
}
exports.getDenoDependencyFactory = getDenoDependencyFactory;
