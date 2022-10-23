import { describe, it, expect } from "vitest";
import getFileTypeAndContent from "../../src/lib/config/fileAndContent";
import { parseAsDenoifyConfig } from "../../src/lib/config/parseParams";
import { assert } from "tsafe/assert";

const testParseParams = () =>
    describe("parse denoify config params", () => {
        const configDummy = {
            out: "dist/index.ts",
            index: "./src/index.ts"
        };

        it("should return undefined when there is no file to parse", () => {
            expect(
                parseAsDenoifyConfig({
                    configFileType: {
                        type: "absent"
                    }
                })
            ).toBeUndefined();
        });

        it("should parse each JSON config from '%s' and return the value of each key-value pairs", async () => {
            const configFileRawContent = JSON.stringify(configDummy);
            const configFileType = await getFileTypeAndContent({
                "getConfigFileRawContent": async configFileBasename =>
                    configFileBasename !== "denoify.config.json" ? undefined : configFileRawContent
            });

            expect(configFileType.type).toBe("json");

            assert(configFileType.type === "json");

            expect(configFileType.configFileBasename).toBe("denoify.config.json");
            expect(configFileType.configFileRawContent).toBe(configFileRawContent);

            const yaml = parseAsDenoifyConfig({
                configFileType
            });

            expect(yaml).toBeTruthy();
            assert(yaml !== undefined);
            expect(yaml.out).toBe(configDummy.out);
            expect(yaml.index).toBe(configDummy.index);
        });

        it("should parse each JavaScript config and return the value of each key-value pairs", async () => {
            const configFileRawContent = `module.exports = ${JSON.stringify(configDummy)}`;
            const configFileType = await getFileTypeAndContent({
                "getConfigFileRawContent": async configFileBasename => (configFileBasename !== "denoify.config.js" ? undefined : configFileRawContent)
            });

            expect(configFileType.type).toBe("js");

            switch (configFileType.type) {
                case "json":
                case "absent":
                    throw new Error("The only valid type is js and its asserted to be so");
            }

            expect(configFileType.configFileBasename).toBe("denoify.config.js");
            expect(configFileType.configFileRawContent).toBe(configFileRawContent);

            const moduleExports = parseAsDenoifyConfig({
                configFileType
            });
            assert(moduleExports !== undefined);

            expect(moduleExports.out).toBe(configDummy.out);
            expect(moduleExports.index).toBe(configDummy.index);
        });
    });

export default testParseParams;
