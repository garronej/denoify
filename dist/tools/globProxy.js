"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const glob = require("glob");
function globProxyFactory(params) {
    const { cwdAndRood } = params;
    function globProxy(params) {
        const { pathWithWildcard } = params;
        return new Promise((resolve, reject) => glob(pathWithWildcard, {
            "cwd": cwdAndRood,
            "root": cwdAndRood,
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
