import { describe, it, expect } from "vitest";
import getFileTypeAndContent from "../../src/lib/config/fileAndContent";
import { parseAsDenoifyConfig } from "../../src/lib/config/parseParams";

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

        it.each([[".denoifyrc", ".denoifyrc.json", ".denoifyrc.yaml", , ".denoifyrc.yml"]])(
            "should parse each YAML/JSON config from '%s' and return the value of each key-value pairs",
            async configFileBasename => {
                const configFileRawContent = `{${[`"out": "${configDummy.out}"`, `"index": "${configDummy.index}"`].join(",")}}`;
                const configFileType = await getFileTypeAndContent({
                    "getConfigFileRawContent": () => Promise.resolve(configFileRawContent)
                });

                expect(configFileType.type).toBe("yaml");

                switch (configFileType.type) {
                    case "js":
                    case "absent":
                        throw new Error("The only valid type is yaml and its asserted to be so");
                }

                expect(configFileType.configFileBasename).toBe(configFileBasename);
                expect(configFileType.configFileRawContent).toBe(configFileRawContent);

                const yaml = parseAsDenoifyConfig({
                    configFileType
                });

                expect(yaml).toBeTruthy();
                expect(yaml.out).toBe(configDummy.out);
                expect(yaml.index).toBe(configDummy.index);
            }
        );

        it.only.each([[".denoifyrc.js", "denoify.config.js", "denoify.config.cjs"]])(
            "should parse each JavaScript config and return the value of each key-value pairs",
            async configFileBasename => {
                const configFileRawContent = `module.exports = {${[`out: "${configDummy.out}"`, `index: "${configDummy.index}"`].join(",")}}`;
                const configFileType = await getFileTypeAndContent({
                    "getConfigFileRawContent": () => Promise.resolve(configFileRawContent)
                });

                expect(configFileType.type).toBe("js");

                switch (configFileType.type) {
                    case "yaml":
                    case "absent":
                        throw new Error("The only valid type is js and its asserted to be so");
                }

                expect(configFileType.configFileBasename).toBe(configFileBasename);
                expect(configFileType.configFileRawContent).toBe(configFileRawContent);

                const moduleExports = parseAsDenoifyConfig({
                    configFileType
                });

                expect(moduleExports.out).toBe(configDummy.out);
                expect(moduleExports.index).toBe(configDummy.index);
            }
        );
    });

export default testParseParams;
