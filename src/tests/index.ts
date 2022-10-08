import testParseParams from "./parseParams";
import testReplacer from "./replacer";
import testGetInstalledVersionPackageJson from "./getInstalledVersionPackageJson";
import testParsedImportExportStatementTypes from "./types/parsedImportExportStatement";
import { Tests } from "./shared";
import testGetValidImportUrl from "./resolveNodeModuleToDenoModule/getValidImportUrl";
import testParseAndReadConfigFile from "./configFile";
import testResolveNodeModuleToDenoModule from "./resolveNodeModuleToDenoModule/resolveNodeModuleToDenoModule";
import testDenoifyImportExportStatement from "./denoifyImportExportStatement";
import testDenoifySingleFile from "./denoifySingleFile";

const tests: Tests = [
    [testParseParams],
    [testReplacer],
    [testGetInstalledVersionPackageJson],
    [testParsedImportExportStatementTypes],
    [testGetValidImportUrl],
    [testParseAndReadConfigFile],
    [testResolveNodeModuleToDenoModule],
    [testDenoifyImportExportStatement],
    [testDenoifySingleFile, "only"]
];

const selectedTests = tests.filter(([_, only]) => only);

if (process.env.IS_CI && selectedTests.length) {
    throw new Error('cannot have "only" in ci cd');
}

(!selectedTests.length ? tests : selectedTests).forEach(([test]) => test());
