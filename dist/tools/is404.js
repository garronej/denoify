"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_fetch_1 = require("node-fetch");
function is404(url) {
    return node_fetch_1.default(url).then(function (_a) {
        var status = _a.status;
        return status === 404;
    });
}
exports.is404 = is404;
