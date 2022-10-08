import { Tests } from "../../shared";
import test1 from "./test1";
import test2 from "./test2";

const testGetValidImportUrl = () => {
    const tests: Tests = [[test1], [test2, "only"]];

    const selectedTests = tests.filter(([_, only]) => only);

    if (process.env.IS_CI && selectedTests.length) {
        throw new Error('cannot have "only" for `testGetValidImportUrl` in ci cd');
    }

    (!selectedTests.length ? tests : selectedTests).forEach(([test]) => test());
};

export default testGetValidImportUrl;
