"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeExecutableReplacerFactory = exports.makeThisModuleAnExecutableReplacer = exports.ParsedImportExportStatement = void 0;
const typeSafety_1 = require("evt/tools/typeSafety");
const st = require("scripting-tools");
const addCache_1 = require("../tools/addCache");
const ParsedImportExportStatement_1 = require("./types/ParsedImportExportStatement");
var ParsedImportExportStatement;
(function (ParsedImportExportStatement) {
    ParsedImportExportStatement.stringify = ParsedImportExportStatement_1.ParsedImportExportStatement.stringify;
})(ParsedImportExportStatement = exports.ParsedImportExportStatement || (exports.ParsedImportExportStatement = {}));
const exitCodeForUndefined = 153;
const separatorBetweenDebugAndResult = "\n===========>> | REPLACER RESULT | <<===========\n";
/**
 * Assert the replacer never throws, if you do not want to override
 * the normal module resolution just return undefined.
 */
async function makeThisModuleAnExecutableReplacer(replacer) {
    process.once("unhandledRejection", error => { throw error; });
    let [, , importExportStatement, version, destDirPath] = process.argv;
    typeSafety_1.assert(typeof version !== undefined, `expect: node ${process.argv[1]} '<importExportStatement>' <version>`);
    const parsedImportExportStatement = ParsedImportExportStatement_1.ParsedImportExportStatement.parse(JSON.parse(`"${importExportStatement.replace(/"/g, '\\"')}"`));
    typeSafety_1.assert(parsedImportExportStatement.parsedArgument.type === "DEPENDENCY");
    //NOTE: Should be inferable...
    typeSafety_1.assert(typeSafety_1.typeGuard(parsedImportExportStatement));
    const result = await replacer({
        parsedImportExportStatement,
        importExportStatement,
        version,
        destDirPath
    });
    if (result === undefined) {
        process.exit(exitCodeForUndefined);
    }
    process.stdout.write(separatorBetweenDebugAndResult +
        result);
    process.exit(0);
}
exports.makeThisModuleAnExecutableReplacer = makeThisModuleAnExecutableReplacer;
function consumeExecutableReplacerFactory(params) {
    const { executableFilePath } = params;
    const consumeExecutableReplacer = addCache_1.addCache(async (params) => {
        const { parsedImportExportStatement, version, destDirPath } = params;
        let out;
        try {
            out = await st.exec(`"${process.argv[0]}" "${executableFilePath}" ${JSON.stringify(ParsedImportExportStatement_1.ParsedImportExportStatement.stringify(parsedImportExportStatement))} ${version} ${JSON.stringify(destDirPath)}`);
        }
        catch (error) {
            if (error.code === exitCodeForUndefined) {
                return undefined;
            }
            throw error;
        }
        const [debugLog, result] = out.split(separatorBetweenDebugAndResult);
        if (debugLog) {
            process.stdout.write(debugLog);
        }
        return result;
    });
    return { consumeExecutableReplacer };
}
exports.consumeExecutableReplacerFactory = consumeExecutableReplacerFactory;
//# sourceMappingURL=replacer.js.map