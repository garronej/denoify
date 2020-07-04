"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModuleAddress_1 = require("../../lib/ModuleAddress");
const inDepth = require("evt/tools/inDepth");
const typeSafety_1 = require("evt/tools/typeSafety");
(async () => {
    const moduleAddress = {
        "type": "GITHUB REPO",
        "userOrOrg": "garronej",
        "repositoryName": "ts-md5",
        "branch": undefined
    };
    for (const prefix of ["", "github:"]) {
        typeSafety_1.assert(inDepth.same(ModuleAddress_1.ModuleAddress.parse(`${prefix}garronej/ts-md5`), moduleAddress));
        typeSafety_1.assert(inDepth.same(ModuleAddress_1.ModuleAddress.parse(`${prefix}garronej/ts-md5#1.2.7`), {
            ...moduleAddress,
            "branch": "1.2.7"
        }));
    }
    console.log("PASS");
})();
//# sourceMappingURL=test1.js.map