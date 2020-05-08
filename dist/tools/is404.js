"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
function is404(url) {
    return node_fetch_1.default(url).then(({ status }) => status === 404);
}
exports.is404 = is404;
