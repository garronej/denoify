import testParseParams from "./parseParams";
import testReplacer from "./replacer";
import testGetInstalledVersionPackageJson from "./getInstalledVersionPackageJson";
import testParsedImportExportStatementTypes from "./types/parsedImportExportStatement";
import { Tests } from "./shared";
import testGetValidImportUrl from "./resolveNodeModuleToDenoModule/getValidImportUrl";
import testReadConfigFile from "./configFile";
import testResolveNodeModuleToDenoModule from "./resolveNodeModuleToDenoModule/resolveNodeModuleToDenoModule";

const tests: Tests = [
    [testParseParams],
    [testReplacer],
    [testGetInstalledVersionPackageJson],
    [testParsedImportExportStatementTypes],
    [testGetValidImportUrl],
    [testReadConfigFile],
    [testResolveNodeModuleToDenoModule, "only"]
];

const selectedTests = tests.filter(([_, only]) => only);

if (process.env.IS_CI && selectedTests.length) {
    throw new Error('cannot have "only" in ci cd');
}

(!selectedTests.length ? tests : selectedTests).forEach(([test]) => test());
