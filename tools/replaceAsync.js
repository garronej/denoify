"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceAsync = void 0;
/** Equivalent of String.prototype.replace but with async replacer is async */
async function replaceAsync(str, regex, replacerAsync) {
    const promises = [];
    str.replace(regex, (match, ...args) => {
        const promise = replacerAsync(match, ...args);
        promises.push(promise);
        return "";
    });
    const data = await Promise.all(promises);
    return str.replace(regex, () => data.shift());
}
exports.replaceAsync = replaceAsync;
//# sourceMappingURL=replaceAsync.js.map