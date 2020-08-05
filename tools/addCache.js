"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCache = void 0;
const fs = require("fs");
/** Save results of anterior calls */
function addCache(f, params) {
    const previousResults = (params === undefined ||
        !fs.existsSync(params.filePathForPersistanceAcrossRun)) ? {} : JSON.parse(fs.readFileSync(params.filePathForPersistanceAcrossRun)
        .toString("utf8"));
    if (params !== undefined) {
        process.once("exit", () => fs.writeFileSync(params.filePathForPersistanceAcrossRun, Buffer.from(JSON.stringify(previousResults), "utf8")));
    }
    return (async function callee(...args) {
        const key = JSON.stringify(args);
        if (key in previousResults) {
            return previousResults[key][0];
        }
        previousResults[key] = [await f(...args)];
        //NOTE: So that JSON.parse restore it well.
        if (previousResults[key][0] === undefined) {
            previousResults[key].pop();
        }
        return callee(...args);
    });
}
exports.addCache = addCache;
//# sourceMappingURL=addCache.js.map