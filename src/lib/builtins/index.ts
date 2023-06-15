import * as __dirnameBuiltin from "./__dirname";
import * as __filenameBuiltin from "./__filename";
import * as bufferBuiltin from "./buffer";
import * as processBuiltin from "./process";

/**
 * This is how we handle Node builtins
 *
 * Each module in this directory should export two functions:
 * - test: (sourceCode: string) => boolean returns true if the source code needs to be modified because it refers to a Node builtin
 * - modification: string[] the lines of code to prepend to the source code
 */
const builtins = [__filenameBuiltin, __dirnameBuiltin, bufferBuiltin, processBuiltin];

export default builtins;
