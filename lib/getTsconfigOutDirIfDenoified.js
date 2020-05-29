"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTsconfigOutDirIfDenoified = void 0;
const Scheme_1 = require("./Scheme");
const commentJson = require("comment-json");
const node_fetch_1 = require("node-fetch");
exports.getTsconfigOutDirIfDenoified = (() => {
    async function isDenoified(params) {
        const { scheme } = params;
        const urlToIndex = Scheme_1.Scheme.buildUrl(scheme, {});
        let modTsRaw;
        try {
            modTsRaw = await node_fetch_1.default(urlToIndex)
                .then(res => res.text());
        }
        catch (_a) {
            return false;
        }
        if (!modTsRaw.match(/denoify/i)) {
            return false;
        }
        return true;
    }
    /** Asserts denoified module */
    async function getTsconfigOutDir(params) {
        const { scheme } = params;
        return {
            "tsconfigOutDir": commentJson.parse(await node_fetch_1.default(Scheme_1.Scheme.buildUrl(scheme, { "pathToFile": "tsconfig.json" })).then(res => res.text()))["compilerOptions"]["outDir"]
        };
    }
    async function getTsconfigOutDirIfDenoified(params) {
        const { scheme } = params;
        if (!(await isDenoified({ scheme }))) {
            return { "tsconfigOutDir": undefined };
        }
        return getTsconfigOutDir({ scheme });
    }
    return { getTsconfigOutDirIfDenoified };
})().getTsconfigOutDirIfDenoified;
//# sourceMappingURL=getTsconfigOutDirIfDenoified.js.map