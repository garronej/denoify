"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globProxyFactory = void 0;
var glob = require("glob");
function globProxyFactory(params) {
    var cwdAndRood = params.cwdAndRood;
    function globProxy(params) {
        var pathWithWildcard = params.pathWithWildcard;
        return new Promise(function (resolve, reject) {
            return glob(pathWithWildcard, {
                "cwd": cwdAndRood,
                "root": cwdAndRood,
                "dot": true
            }, function (er, files) {
                if (!!er) {
                    reject(er);
                    return;
                }
                resolve(files);
            });
        });
    }
    return { globProxy: globProxy };
}
exports.globProxyFactory = globProxyFactory;
//# sourceMappingURL=globProxy.js.map