"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIsDryRun = void 0;
function getIsDryRun() {
    const isDryRun = !(process.env["DRY_RUN"] === "0");
    if (isDryRun) {
        console.log([
            "Executing the script in dry mode, no operation will be actually performed.",
            "To disable dry mode set DRY_RUN environnement variable to '0'",
            ""
        ].join("\n"));
    }
    return { isDryRun };
}
exports.getIsDryRun = getIsDryRun;
//# sourceMappingURL=getIsDryRun.js.map