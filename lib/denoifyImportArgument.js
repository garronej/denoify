"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.denoifyImportArgumentFactory = void 0;
const path = require("path");
const addCache_1 = require("../tools/addCache");
const Scheme_1 = require("./Scheme");
const fs = require("fs");
const is404_1 = require("../tools/is404");
/**
 * examples:
 * "evt" -> "https://deno.land/x/evt@.../mod.ts"
 * "evt/dist/tools/typeSafety" -> "https://deno.land/x/evt@.../deno_dist/tools/typeSafety/index.ts"
 * "./interfaces" -> "./interfaces/index.ts"
 */
function denoifyImportArgumentFactory(params) {
    const resolve = addCache_1.addCache(params.resolve);
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
        const resolveResult = await resolve({ nodeModuleName });
        if (resolveResult.type === "NON-FATAL UNMET DEPENDENCY") {
            return `${importStr} DENOIFY: DEPENDENCY UNMET (${resolveResult.kind})`;
        }
        if (!specificImportPath) {
            const out = Scheme_1.Scheme.buildUrl(resolveResult.scheme, {});
            if (await is404_1.is404(out)) {
                throw new Error(`${out} 404 not found !`);
            }
            return out;
        }
        for (const tsconfigOutDir of [
            (() => {
                switch (resolveResult.type) {
                    case "DENOIFIED MODULE":
                        return resolveResult.tsconfigOutDir.replace(/\\/g, "/");
                    case "HANDMADE PORT":
                        return "dist";
                }
            })(),
            undefined
        ]) {
            let out = Scheme_1.Scheme.buildUrl(resolveResult.scheme, {
                "pathToFile": (tsconfigOutDir === undefined ?
                    specificImportPath
                    :
                        path.posix.join(path.posix.join(path.posix.dirname(tsconfigOutDir), // .
                        `deno_${path.posix.basename(tsconfigOutDir)}` //deno_dist
                        ), // deno_dist
                        path.posix.relative(tsconfigOutDir, specificImportPath // dest/tools/typeSafety
                        ) //  tools/typeSafety
                        ) // deno_dist/tool/typeSafety
                ) + ".ts" // deno_dist/tool/typeSafety.ts
            });
            walk: {
                if (await is404_1.is404(out)) {
                    break walk;
                }
                return out;
            }
            out = out
                .replace(/\.ts$/, "/index.ts");
            walk: {
                if (await is404_1.is404(out)) {
                    break walk;
                }
                return out;
            }
        }
        throw new Error([
            `Problem resolving ${importStr} in ${fileDirPath} with`,
            `${JSON.stringify(resolveResult.scheme)} 404 not found.`
        ].join(" "));
    }
    return { denoifyImportArgument };
}
exports.denoifyImportArgumentFactory = denoifyImportArgumentFactory;
//# sourceMappingURL=denoifyImportArgument.js.map