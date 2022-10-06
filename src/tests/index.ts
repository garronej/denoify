import testParseParams from "./parseParams";
import testReplacer from "./replacer";

const tests: ReadonlyArray<readonly [() => void, "only"?]> = [[testParseParams], [testReplacer, "only"]];

const selectedTests = tests.filter(([_, only]) => only);

if (process.env.IS_CI && selectedTests.length) {
    throw new Error('cannot have "only" in ci cd');
}

(!selectedTests.length ? tests : selectedTests).forEach(([test]) => test());
