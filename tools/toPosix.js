"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPosix = void 0;
function toPosix(potentiallyWin32Path) {
    return potentiallyWin32Path.replace(/\\/g, "/");
}
exports.toPosix = toPosix;
//# sourceMappingURL=toPosix.js.map