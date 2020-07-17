

import { runSequentially } from "../../tools/runSequentially";

runSequentially({
    "scriptsPaths": [
        "getValidImportUrl", 
        "resolveNodeModuleToDenoModule"
    ]
});
