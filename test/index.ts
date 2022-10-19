import testReplacer from "./replacer";
import testGetInstalledVersionPackageJson from "./getInstalledVersionPackageJson";
import testParsedImportExportStatementTypes from "./types/parsedImportExportStatement";
import testGetValidImportUrl from "./resolveNodeModuleToDenoModule/getValidImportUrl";
import testParseAndReadConfigFile from "./configFile";
import testResolveNodeModuleToDenoModule from "./resolveNodeModuleToDenoModule/resolveNodeModuleToDenoModule";
import testDenoifyImportExportStatement from "./denoifyImportExportStatement";
import testDenoifySingleFile from "./denoifySingleFile";
import testCases from "cases-of-test";
import testParseParams from "./config";

testCases({
    tests: [
        [testParseParams, "only"],
        [testReplacer],
        [testGetInstalledVersionPackageJson],
        [testParsedImportExportStatementTypes],
        [testGetValidImportUrl],
        [testParseAndReadConfigFile],
        [testResolveNodeModuleToDenoModule],
        [testDenoifyImportExportStatement],
        [testDenoifySingleFile]
    ]
});
