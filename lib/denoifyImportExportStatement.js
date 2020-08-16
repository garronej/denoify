"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.denoifyImportExportStatementFactory = void 0;
const path = require("path");
const typeSafety_1 = require("evt/tools/typeSafety");
const fs = require("fs");
const ParsedImportExportStatement_1 = require("./types/ParsedImportExportStatement");
const replacer_1 = require("./replacer");
const getProjectRoot_1 = require("../tools/getProjectRoot");
/**
 * examples:
 * import { Evt } from "evt" -> import { Evt } from "https://deno.land/x/evt@.../mod.ts"
 * import { id } "evt/dist/tools/typeSafety" -> "https://deno.land/x/evt@.../deno_dist/tools/typeSafety/index.ts"
 * import * as interfaces from "./interfaces" -> import * as interfaces from "./interfaces/index.ts"
 */
function denoifyImportExportStatementFactory(params) {
    const { userProvidedReplacerPath, resolveNodeModuleToDenoModule, getInstalledVersionPackageJson } = params;
    const { consumeExecutableReplacer: consumeExecutableBuiltinsReplacer } = replacer_1.consumeExecutableReplacerFactory({
        "filePath": path.join(getProjectRoot_1.getProjectRoot(), fs.existsSync(path.join(getProjectRoot_1.getProjectRoot(), "dist")) ? "dist" : "", "bin", "replacer", "index.js")
    });
    const { consumeExecutableReplacer: consumeExecutableUserProvidedReplacer } = userProvidedReplacerPath === undefined ?
        { "consumeExecutableReplacer": undefined } :
        replacer_1.consumeExecutableReplacerFactory({
            "filePath": userProvidedReplacerPath
        });
    async function denoifyImportExportStatement(params) {
        const { fileDirPath, importExportStatement } = params;
        const parsedImportExportStatement = ParsedImportExportStatement_1.ParsedImportExportStatement.parse(params.importExportStatement);
        if (parsedImportExportStatement.parsedArgument.type === "URL") {
            //There is no reason to have url import in the source
            //file as url import are not supported by node it does not 
            //hurt to leave the import unchanged. See #7
            return importExportStatement;
        }
        const stringify = (argument) => ParsedImportExportStatement_1.ParsedImportExportStatement.stringify({
            ...parsedImportExportStatement,
            "parsedArgument": ParsedImportExportStatement_1.ParsedImportExportStatement.ParsedArgument.parse(argument)
        });
        if (parsedImportExportStatement.parsedArgument.type === "PROJECT LOCAL FILE") {
            const { relativePath } = parsedImportExportStatement.parsedArgument;
            if (/\.json$/i.test(relativePath)) {
                return stringify(relativePath);
            }
            for (const ext of ["ts", "tsx"]) {
                if (fs.existsSync(path.join(fileDirPath, `${relativePath}.${ext}`))) {
                    return stringify(`${relativePath}.${ext}`);
                }
            }
            const out = path.posix.join(relativePath, "index.ts");
            return stringify(out.startsWith(".") ? out : `./${out}`);
        }
        //NOTE: Should be inferable...
        typeSafety_1.assert(typeSafety_1.typeGuard(parsedImportExportStatement));
        const { nodeModuleName, specificImportPath } = parsedImportExportStatement.parsedArgument;
        const { version } = await getInstalledVersionPackageJson({ nodeModuleName })
            .catch(() => ({ "version": "0.0.0" }));
        for (const consumeExecutableReplacer of [
            consumeExecutableUserProvidedReplacer,
            consumeExecutableBuiltinsReplacer
        ]) {
            const result = await (consumeExecutableReplacer === null || consumeExecutableReplacer === void 0 ? void 0 : consumeExecutableReplacer({
                parsedImportExportStatement,
                version,
                "sourceFileDirPath": fileDirPath
            }));
            if (result === undefined) {
                continue;
            }
            return result;
        }
        const nodeToDenoModuleResolutionResult = await resolveNodeModuleToDenoModule({ nodeModuleName });
        if (nodeToDenoModuleResolutionResult.result === "NON-FATAL UNMET DEPENDENCY") {
            return stringify(`${ParsedImportExportStatement_1.ParsedImportExportStatement.ParsedArgument.stringify(parsedImportExportStatement.parsedArgument)} DENOIFY: DEPENDENCY UNMET (${nodeToDenoModuleResolutionResult.kind})`);
        }
        const { getValidImportUrl } = nodeToDenoModuleResolutionResult;
        return stringify(await getValidImportUrl(!specificImportPath ?
            ({ "target": "DEFAULT EXPORT" }) :
            ({ "target": "SPECIFIC FILE", specificImportPath })));
    }
    return { denoifyImportExportStatement };
}
exports.denoifyImportExportStatementFactory = denoifyImportExportStatementFactory;
//# sourceMappingURL=denoifyImportExportStatement.js.map