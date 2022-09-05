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
                type: "extensionless",
                file: ".denoifyrc",
                config: `
out: 
    ${configDummy.out}
index:
    "${configDummy.index}"
        `
            },
            {
                type: "yaml",
                file: ".denoifyrc.yaml",
                config: `
out: 
    ${configDummy.out}
index:
    "${configDummy.index}"
        `
            },
            {
                type: "json",
                file: ".denoifyrc.json",
                config: `
{
  "out": "${configDummy.out}",
  "index": "${configDummy.index}"
}
        `
            },
            {
                type: "js",
                file: ".denoifyrc.js",
                config: `
module.exports = {
  out: "${configDummy.out}",
  index: "${configDummy.index}"
}
        `
            },
            {
                type: "js",
                file: ".denoifyrc.js",
                config: `
exports.name = {
  out: "${configDummy.out}",
  index: "${configDummy.index}"
}
        `
            }
        ] as const
    ).every(({ type, file, config }) => {
        const yaml = configuration().parseAsDenoifyConfig({
            type,
            file,
            config
        });
        return yaml !== undefined && yaml.out === configDummy.out && yaml.index === configDummy.index;
    });

    assert(isConfigValid === true);

    console.log("PASS");
})();
