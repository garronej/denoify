import testParseParams from "./parseParams";
import testReplacer from "./replacer";
import testGetInstalledVersionPackageJson from "./getInstalledVersionPackageJson";
import testParsedImportExportStatementTypes from "./types/parsedImportExportStatement";
import { Tests } from "./shared";
import testGetValidImportUrl from "./resolveNodeModuleToDenoModule/getValidImportUrl";

const tests: Tests = [
    [testParseParams],
    [testReplacer],
    [testGetInstalledVersionPackageJson],
    [testParsedImportExportStatementTypes],
    [testGetValidImportUrl, "only"]
];

const selectedTests = tests.filter(([_, only]) => only);

if (process.env.IS_CI && selectedTests.length) {
    throw new Error('cannot have "only" in ci cd');
}

(!selectedTests.length ? tests : selectedTests).forEach(([test]) => test());
