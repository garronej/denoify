
import * as path from "path";
import { addCache } from "../tools/addCache";
import { Scheme } from "./Scheme";
import * as fs from "fs";
import { is404 } from "../tools/is404";
import type { Result as ResolveResult } from "./resolve";

/**
 * examples: 
 * "evt" -> "https://deno.land/x/evt@.../mod.ts"
 * "evt/dist/tools/typeSafety" -> "https://deno.land/x/evt@.../deno_dist/tools/typeSafety/index.ts"
 * "./interfaces" -> "./interfaces/index.ts"
 */
export function denoifyImportArgumentFactory(
    params: {
        resolve(params: { nodeModuleName: string; }): Promise<ResolveResult>;
    }
) {

    const resolve = addCache(params.resolve);

    async function denoifyImportArgument(
        params: {
            /** Path of the file in which the import was */
            fileDirPath: string; //
            /** e.g:  
             * "evt" 
             * "evt/dist/tools/typeSafety" 
             * "evt/dist/tools/typeSafety/assert"
             * ... 
             */
            importArgument: string;
        }
    ): Promise<string> {

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

            const out = path.join(importStr, "index.ts");

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
            return `${importStr} DENOIFY: DEPENDENCY UNMET (${resolveResult.kind})`
        }

        if (!specificImportPath) {

            const out=  Scheme.buildUrl(resolveResult.scheme, {});

            if (await is404(out)) {
                throw new Error(`${out} 404 not found.`);
            }

            return out;

        }

        for (const tsconfigOutDir of [
            (() => {
                switch (resolveResult.type) {
                    case "DENOIFIED MODULE": return resolveResult.tsconfigOutDir;
                    case "HANDMADE PORT": return "dist";
                }
            })(),
            undefined
        ]) {


            let out = Scheme.buildUrl(
                resolveResult.scheme,
                {
                    "pathToFile":
                        (tsconfigOutDir === undefined ?
                            specificImportPath
                            :
                            path.join(
                                path.join(
                                    path.dirname(tsconfigOutDir), // .
                                    `deno_${path.basename(tsconfigOutDir)}`//deno_dist
                                ), // deno_dist
                                path.relative(
                                    tsconfigOutDir,
                                    specificImportPath // dest/tools/typeSafety
                                ) //  tools/typeSafety
                            ) // deno_dist/tool/typeSafety
                        ) + ".ts" // deno_dist/tool/typeSafety.ts
                }
            );

            walk: {

                if (await is404(out)) {
                    break walk;
                }

                return out;

            }

            out = out
                .replace(/\.ts$/, "/index.ts")
                // https://.../deno_dist/tool/typeSafety/index.ts
                ;

            walk: {

                if (await is404(out)) {
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