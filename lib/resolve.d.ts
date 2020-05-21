import { Scheme } from "./Scheme";
export declare type Result = {
    type: "HANDMADE PORT";
    scheme: Scheme;
} | {
    type: "DENOIFIED MODULE";
    scheme: Scheme;
    tsconfigOutDir: string;
} | {
    type: "NON-FATAL UNMET DEPENDENCY";
    kind: "DEV DEPENDENCY" | "BUILTIN";
};
/**
 *
 * Example 1:
 *
 * Context:
 * - package.json "dependencies" has an entry { "js-yaml": "~3.12.0" }
 * - There is no entry "js-yaml" in package.json "denoPorts"
 * - The version field in "./node_modules/js-yaml/package.json" is "3.12.1"
 *
 * Resolve is called with:
 * nodeModuleName: "js-yaml"
 *
 * ->
 *
 * The resolution goes as follow:
 * - The entry "js-yaml" in package.json is not a "github:xxx" scheme. Skip
 * - We use "./node_modules/js-yaml/package.json" repository field to lookup
 *   the github repo hosting the module: KSXGitHub/simple-js-yaml-port-for-deno.
 *   We found out that it is not a denoified module ( there is not a "./mod.ts" file
 *   containing the work "denoify"). Skip
 * - There is no entry "js-yaml" in package.json "denoPorts". Skip
 * - There is an entry { "js-yaml": "https://deno.land/x/js_yaml_port/js-yaml.js" }
 *   in knownPort.json, GET https://deno.land/x/js_yaml_port@3.12.1/js-yaml.js is not a 404. Done
 *
 * {
 * "type": "HANDMADE PORT",
 * "scheme": {
 *     "type": "url",
 *     "urlType": "deno.land",
 *     "baseUrlWithoutBranch": "https://deno.land/x/js_yaml_port",
 *     "branch": "3.12.1",
 *     "pathToIndex": "js-yaml.js"
 * }
 * }
 *
 *
 * If the version field in "./node_modules/js-yaml/package.json" was "3.12.2"
 * as GET https://deno.land/x/js_yaml_port@3.12.2/js-yaml.js gives a 404
 * ( KSXGitHub/simple-js-yaml-port-for-deno as no "v3.12.2" or "3.12.2" branch )
 * the result would have been the same without the "branch" property in the "scheme" and
 * a warning would have been printed to the console.
 *
 * Example 2:
 *
 * Context:
 * - package.json "dependencies" has no entry for "fs"
 * - There is no entry "fs" in package.json "denoPorts"
 *
 * Resolve is called with:
 * nodeModuleName: "fs"
 *
 * ->
 *
 * The resolution goes as follow:
 * - "fs" is not present in "dependencies" nor "devDependencies" of package.json, assuming node builtin.
 * - There is no entry for "fs" in package.json "denoPorts". Skip
 * - There is an entry { "fs": "https://deno.land/std/node/fs.ts" } in known port. Done
 *
 * {
 * "type": "HANDMADE PORT",
 * "scheme": {
 *     "type": "url",
 *     "urlType": "deno.land",
 *     "baseUrlWithoutBranch": "https://deno.land/std",
 *     "pathToIndex": "node/fs.ts"
 * }
 * }
 *
 * Example 3:
 *
 * Context:
 * - package.json "dependencies" has an entry { "ts-md5": "~1.2.7" }
 * - There is no entry "ts-md5" in package.json "denoPorts"
 * - The version field in "./node_modules/js-yaml/package.json" is "1.2.7"
 *
 * Resolve is called with:
 * nodeModuleName: "ts-md5"
 *
 * ->
 *
 * The resolution goes as follow:
 * - The entry "ts-md5" in package.json is not a "github:xxx" scheme. Skip
 * - We use "./node_modules/ts-md5/package.json" repository field to lookup
 *   the github repo hosting the module: cotag/ts-md5.
 *   We found out that it is not a denoified module. Skip
 * - There is no entry "ts-md5" in package.json "denoPorts". Skip
 * - There is an entry { "ts-md5": "garronej/ts-md5" }
 *   in knownPort.json, GET https://raw.github.com/garronej/ts-md5/v1.2.7/mod.ts is not a 404
 *   and contain the word denoify. Done
 *
 * We lookup the "outDir" in https://raw.github.com/garronej/ts-md5/v1.2.7/tsconfig.json,
 * we need it so import "ts-md5/dist/md5_worker" can be replaced by "ts-md5/deno_dist/md5_worker.ts" later on.
 *
 * {
 * "type": "DENOIFIED MODULE",
 * "scheme": {
 *     "type": "github",
 *     "userOrOrg": "garronej",
 *     "repositoryName": "ts-md5",
 *     "branch": "v1.2.7"
 * },
 * "tsconfigOutDir": "dist"
 * }
 *
 * Example 4:
 *
 * Context:
 * - package.json "dependencies" has an entry { "ts-md5": "garronej/ts-md5#1.2.7" }
 *
 * Resolve is called with:
 * nodeModuleName: "ts-md5"
 *
 * ->
 *
 * The resolution goes as follow:
 * - The entry "js-yaml" in package.json ("garronej/ts-md5") is a "github:xxx" scheme.
 *   GET https://raw.github.com/garronej/ts-md5/v1.2.7/mod.ts is not a 404 and the file
 *   contains the word "denoify". Done
 *
 * We lookup the "outDir" in https://raw.github.com/garronej/ts-md5/v1.2.7/tsconfig.json,
 *
 * {
 * "type": "DENOIFIED MODULE",
 * "scheme": {
 *     "type": "github",
 *     "userOrOrg": "garronej",
 *     "repositoryName": "ts-md5",
 *     "branch": "v1.2.7"
 * },
 * "tsconfigOutDir": "dist"
 * }
 *
 * Example 5:
 *
 * Context:
 * - package.json "dependencies" has an entry { "run-exclusive": "^2.1.0" }
 * - The version field in "./node_modules/run-exclusive/package.json" is "2.1.12".
 *
 * Resolve is called with:
 * nodeModuleName: "run-exclusive"
 *
 * ->
 *
 * The resolution goes as follow:
 * - The entry "run-exclusive" in package.json is not a "github:xxx" scheme. Skip
 * - We use "./node_modules/ts-md5/package.json" repository field to lookup
 *   the github repo hosting the module: garronej/run-exclusive.
 *   https://raw.github.com/garronej/ts-md5/2.1.12/mod.ts is not a 404
 *   and contain the word "denoify". Done
 *
 * We lookup the "outDir" in https://raw.github.com/garronej/run-exclusive/v2.1.12/tsconfig.json,
 *
 * {
 * "type": "DENOIFIED MODULE",
 * "scheme": {
 *     "type": "github",
 *     "userOrOrg": "garronej",
 *     "repositoryName": "run-exclusive",
 *     "branch": "2.1.12"
 * },
 * "tsconfigOutDir": "dist"
 * }
 *
 */
export declare function resolveFactory(params: {
    projectPath: string;
    userProvidedPorts: {
        [nodeModuleName: string]: string;
    };
    dependencies: {
        [nodeModuleName: string]: string;
    };
    devDependencies: {
        [nodeModuleName: string]: string;
    };
    log: typeof console.log;
}): {
    resolve: (params: {
        nodeModuleName: string;
    }) => Promise<Result>;
};
