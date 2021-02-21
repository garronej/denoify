"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runSequentially_1 = require("../tools/runSequentially");
runSequentially_1.runSequentially({
    "scriptsPaths": [
        "resolveNodeModuleToDenoModule",
        "types/parsedImportExportStatement",
        "denoifyImportExportStatement",
        "denoifySingleFile",
        "getInstalledVersionPackageJson",
        "replacer"
    ]
});
//# sourceMappingURL=index.js.map