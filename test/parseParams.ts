import { describe, it, expect } from "vitest";
import { configuration } from "../src/lib/parseParams";

const testParseParams = () =>
    describe("parse denoify config params", () => {
        it("should return undefined when there is no file to parse", () => {
            expect(
                configuration().parseAsDenoifyConfig({
                    type: "absent"
                })
            ).toBeUndefined();
        });
        it("should parse each config and return the value of each key-value pairs", () => {
            const configDummy = {
                out: "dist/index.ts",
                index: "./src/index.ts"
            };

            const isConfigValid = (
                [
                    {
                        type: "yaml",
                        configFileBasename: ".denoifyrc.yaml",
                        configFileRawContent: `
out: 
    ${configDummy.out}
index:
    "${configDummy.index}"
        `
                    },
                    {
                        type: "json",
                        configFileBasename: ".denoifyrc.json",
                        configFileRawContent: `
{
  "out": "${configDummy.out}",
  "index": "${configDummy.index}"
}
        `
                    },
                    {
                        type: "js",
                        configFileBasename: ".denoifyrc.js",
                        configFileRawContent: `
module.exports = {
  out: "${configDummy.out}",
  index: "${configDummy.index}"
}
        `
                    },
                    {
                        type: "js",
                        configFileBasename: ".denoifyrc.js",
                        configFileRawContent: `
exports.name = {
  out: "${configDummy.out}",
  index: "${configDummy.index}"
}
        `
                    }
                ] as const
            ).every(({ type, configFileBasename, configFileRawContent }) => {
                const yaml = configuration().parseAsDenoifyConfig({
                    type,
                    configFileBasename,
                    configFileRawContent
                });
                return yaml !== undefined && yaml.out === configDummy.out && yaml.index === configDummy.index;
            });

            expect(isConfigValid).toBe(true);
        });
    });

export default testParseParams;
