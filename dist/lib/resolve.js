"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const st = require("scripting-tools");
const path = require("path");
function resolveFactory(params) {
    const { projectPath, dependenciesPorts, devDependencies } = params;
    const resolve = async (params) => {
        var _a, _b;
        const { nodeModuleName } = params;
        {
            const url = dependenciesPorts[nodeModuleName];
            if (url !== undefined) {
                return {
                    "type": "PORT",
                    url
                };
            }
        }
        const targetModulePath = st.find_module_path(nodeModuleName, projectPath);
        const url = (_b = (_a = require(path.join(targetModulePath, "package.json"))) === null || _a === void 0 ? void 0 : _a["deno"]) === null || _b === void 0 ? void 0 : _b.url;
        if (url === undefined) {
            if (devDependencies.includes(nodeModuleName)) {
                return { "type": "UNMET DEV DEPENDENCY" };
            }
            throw new Error(`No 'deno' field in ${nodeModuleName} package.json and no entry in index`);
        }
        return {
            "type": "CROSS COMPATIBLE",
            url,
            "tsconfigOutDir": require(path.join(projectPath, "tsconfig.json"))
                .compilerOptions
                .outDir
        };
    };
    return { resolve };
}
exports.resolveFactory = resolveFactory;
