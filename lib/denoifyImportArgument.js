"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.denoifyImportArgumentFactory = void 0;
const path = require("path");
const fs = require("fs");
/**
 * examples:
 * "evt" -> "https://deno.land/x/evt@.../mod.ts"
 * "evt/dist/tools/typeSafety" -> "https://deno.land/x/evt@.../deno_dist/tools/typeSafety/index.ts"
 * "./interfaces" -> "./interfaces/index.ts"
 */
function denoifyImportArgumentFactory(params) {
    const { resolveNodeModuleToDenoModule } = params;
    async function denoifyImportArgument(params) {
        const { fileDirPath } = params;
        const importStr = params
            .importArgument // ./interfaces/
            .replace(/\/+$/, "/index") // ./interfaces/index
        ;
        if (importStr.startsWith(".")) {
            if (/\.json$/i.test(importStr)) {
                return importStr;
            }
            if (fs.existsSync(path.join(fileDirPath, `${importStr}.ts`))) {
                return `${importStr}.ts`;
            }
            const out = path.posix.join(importStr, "index.ts");
            return out.startsWith(".") ? out : `./${out}`;
        }
        const { nodeModuleName, specificImportPath } = (() => {
            const [nodeModuleName, ...rest] = importStr.split("/");
            return {
                nodeModuleName,
                "specificImportPath": rest.join("/")
            };
        })();
        const nodeToDenoModuleResolutionResult = await resolveNodeModuleToDenoModule({ nodeModuleName });
        if (nodeToDenoModuleResolutionResult.result === "NON-FATAL UNMET DEPENDENCY") {
            return `${importStr} DENOIFY: DEPENDENCY UNMET (${nodeToDenoModuleResolutionResult.kind})`;
        }
        const { getValidImportUrl } = nodeToDenoModuleResolutionResult;
        return getValidImportUrl(!specificImportPath ?
            ({ "target": "DEFAULT EXPORT" }) :
            ({ "target": "SPECIFIC FILE", specificImportPath }));
    }
    return { denoifyImportArgument };
}
exports.denoifyImportArgumentFactory = denoifyImportArgumentFactory;
//# sourceMappingURL=denoifyImportArgument.js.map