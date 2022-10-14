import { describe } from "vitest";
import { Tests } from "../../shared";
import test1 from "./test1";
import test2 from "./test2";
import test3 from "./test3";
import test4 from "./test4";
import test5 from "./test5";

const testGetValidImportUrl = () => {
    describe("get valid import url, fallback to latest available version", () => {
        const tests: Tests = [[test1], [test2], [test3], [test4], [test5]];

        const selectedTests = tests.filter(([_, only]) => only);

        if (process.env.IS_CI && selectedTests.length) {
            throw new Error('cannot have "only" for `testGetValidImportUrl` in ci cd');
        }

        (!selectedTests.length ? tests : selectedTests).forEach(([test]) => test());
    });
};

export default testGetValidImportUrl;