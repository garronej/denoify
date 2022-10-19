import { describe } from "vitest";
import testCases from "cases-of-test";
import test1 from "./test1";
import test2 from "./test2";
import test3 from "./test3";
import test4 from "./test4";
import test5 from "./test5";

const testGetValidImportUrl = () => {
    describe("get valid import url, fallback to latest available version", () => {
        testCases({
            tests: [[test1], [test2], [test3], [test4], [test5]]
        });
    });
};

export default testGetValidImportUrl;
