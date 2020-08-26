"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstalledVersionPackageJsonFactory = void 0;
const st = require("scripting-tools");
const addCache_1 = require("../tools/addCache");
const path = require("path");
const fs = require("fs");
function getInstalledVersionPackageJsonFactory(params) {
    const { projectPath } = params;
    const getTargetModulePath = (params) => {
        const { nodeModuleName } = params;
        return st.find_module_path(nodeModuleName, projectPath);
    };
    /** Throw if not installed locally */
    const getInstalledVersionPackageJson = addCache_1.addCache(async (params) => {
        const { nodeModuleName } = params;
        //NOTE: Can throw
        // node_modules/js-yaml
        const targetModulePath = getTargetModulePath({ nodeModuleName });
        return JSON.parse(await new Promise((resolve, reject) => fs.readFile(path.join(targetModulePath, "package.json"), (err, buff) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(buff.toString("utf8"));
        })));
    });
    return { getInstalledVersionPackageJson };
}
exports.getInstalledVersionPackageJsonFactory = getInstalledVersionPackageJsonFactory;
//# sourceMappingURL=getInstalledVersionPackageJson.js.map