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
const errorCodeForUndefined = 153;
/**
 * Assert the replacer never throws, if you do not want to override
 * the normal module resolution just return undefined.
 */
async function makeThisModuleAnExecutableReplacer(replacer) {
    process.once("unhandledRejection", error => { throw error; });
    const [, , importExportStatement, version] = process.argv;
    typeSafety_1.assert(typeof version !== undefined, `expect: node ${process.argv[1]} '<importExportStatement>' <version>`);
    const parsedImportExportStatement = ParsedImportExportStatement_1.ParsedImportExportStatement.parse(importExportStatement);
    typeSafety_1.assert(parsedImportExportStatement.parsedArgument.type === "DEPENDENCY");
    //NOTE: Should be inferable...
    typeSafety_1.assert(typeSafety_1.typeGuard(parsedImportExportStatement));
    const result = await replacer({
        parsedImportExportStatement,
        importExportStatement,
        version
    });
    if (result === undefined) {
        process.exit(errorCodeForUndefined);
    }
    process.stdout.write(result);
    process.exit(0);
}
exports.makeThisModuleAnExecutableReplacer = makeThisModuleAnExecutableReplacer;
function consumeExecutableReplacerFactory(params) {
    const { filePath } = params;
    const consumeExecutableReplacer = addCache_1.addCache(async (params) => {
        const { parsedImportExportStatement, version } = params;
        try {
            return await st.exec(`${process.argv[0]} ${filePath} ${JSON.stringify(ParsedImportExportStatement_1.ParsedImportExportStatement.stringify(parsedImportExportStatement))} ${version}`);
        }
        catch (error) {
            if (error.code === errorCodeForUndefined) {
                return undefined;
            }
            throw error;
        }
    });
    return { consumeExecutableReplacer };
}
exports.consumeExecutableReplacerFactory = consumeExecutableReplacerFactory;
//# sourceMappingURL=replacer.js.map