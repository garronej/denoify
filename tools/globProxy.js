"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globProxyFactory = void 0;
const glob = require("glob");
function globProxyFactory(params) {
    const { cwdAndRoot } = params;
    function globProxy(params) {
        const { pathWithWildcard } = params;
        return new Promise((resolve, reject) => glob(pathWithWildcard, {
            "cwd": cwdAndRoot,
            "root": cwdAndRoot,
            "dot": true
        }, (er, files) => {
            if (!!er) {
                reject(er);
                return;
            }
            resolve(files);
        }));
    }
    return { globProxy };
}
exports.globProxyFactory = globProxyFactory;
//# sourceMappingURL=globProxy.js.map