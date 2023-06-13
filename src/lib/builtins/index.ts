import * as __dirname from "./__dirname";
import * as __filename from "./__filename";
import * as buffer from "./buffer";

/**
 * This is how we handle Node builtins
 *
 * Each module in this directory should export two functions:
 * - test: (sourceCode: string) => boolean returns true if the source code needs to be modified because it refers to a Node builtin
 * - modification: string[] the lines of code to prepend to the source code
 */

const builtins = [__filename, __dirname, buffer];

export default builtins;
