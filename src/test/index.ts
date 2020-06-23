
import { runSequentially } from "../tools/runSequentially";

runSequentially({
    "scriptsPaths": [
        "moduleAddress",
        "denoifyImportArgument",
        "denoifySingleFile",
        "resolveNodeModuleToDenoModule"
    ]
});
