"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Save results of anterior calls */
function addCache(f) {
    const previousResults = new Map();
    return (async function callee(...args) {
        const key = JSON.stringify(args);
        if (previousResults.has(key)) {
            return previousResults.get(key);
        }
        previousResults.set(key, await f(...args));
        return callee(...args);
    });
}
exports.addCache = addCache;
