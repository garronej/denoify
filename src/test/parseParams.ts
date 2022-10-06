import { configuration } from "../lib/parseParams";
import { assert } from "tsafe";

(() => {
    // no config file found
    const absent = configuration().parseAsDenoifyConfig({
        type: "absent"
    });
    assert(absent === undefined);

    // has config file
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

    assert(isConfigValid === true);

    console.log("PASS");
})();
