"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const st = require("scripting-tools");
const path = require("path");
function getDenoDependencyFactory(params) {
    const { projectPath, denoDependencies, devDependencies } = params;
    const getDenoDependency = async (nodeModuleName) => {
        var _a;
        {
            const denoDependency = denoDependencies[nodeModuleName];
            if (denoDependency !== undefined) {
                return denoDependency;
            }
        }
        const packageJsonParsed = require(path.join(st.find_module_path(nodeModuleName, projectPath), "package.json"));
        const denoifyKey = "deno";
        if (!(denoifyKey in packageJsonParsed)) {
            if (devDependencies.includes(nodeModuleName)) {
                return {
                    "url": nodeModuleName,
                    "main": "NO_DENO_EQUIVALENT_FOR_THIS_DEV_DEPENDENCY.ts"
                };
            }
            throw new Error(`No 'deno' field in ${nodeModuleName} package.json and no entry in index`);
        }
        return {
            "url": packageJsonParsed[denoifyKey].url,
            "main": (_a = packageJsonParsed[denoifyKey].main) !== null && _a !== void 0 ? _a : packageJsonParsed.main.replace(/\.js$/i, ".ts")
        };
    };
    return { getDenoDependency };
}
exports.getDenoDependencyFactory = getDenoDependencyFactory;
