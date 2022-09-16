import { runSequentially } from "../tools/runSequentially";

runSequentially({
    "scriptsPaths": [
        "resolveNodeModuleToDenoModule",
        "types/parsedImportExportStatement",
        "denoifyImportExportStatement",
        "denoifySingleFile",
        "getInstalledVersionPackageJson",
        "replacer",
        "parseParams"
    ]
});
