"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.is404 = void 0;
const node_fetch_1 = require("node-fetch");
/** Return true if 404 or 400 */
function is404(url) {
    return node_fetch_1.default(url).then(({ status }) => (status === 404 || status === 400));
}
exports.is404 = is404;
//# sourceMappingURL=is404.js.map