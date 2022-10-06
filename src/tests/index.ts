import testParseParams from "./parseParams";

const tests: ReadonlyArray<readonly [() => void, "only"?]> = [[testParseParams]];

const selectedTests = tests.filter(([_, only]) => only);

if (process.env.IS_CI && selectedTests.length) {
    throw new Error('cannot have "only" in ci cd');
}

(!selectedTests.length ? tests : selectedTests).forEach(([test]) => test());
