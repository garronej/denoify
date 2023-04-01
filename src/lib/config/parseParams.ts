import * as fs from "fs";
import { cosmiconfig } from "cosmiconfig";
import config from ".";
import { ConfigFileType } from "./fileAndContent";
import parse from "parse-dont-validate";

export type DenoifyParams = {
    replacer?: string;
    ports?: {
        [portName: string]: string;
    };
    out?: string;
    index?: string;
    includes?: (
        | string
        | {
              src: string;
              destDir?: string;
              destBasename?: string;
          }
    )[];
};

export function parseAsDenoifyParams(denoifyParams: any): DenoifyParams | undefined {
    if (denoifyParams === undefined) {
        return undefined;
    }

    const generateErrorMessage = ({ name, type, param }: { name: string; type: string; param: unknown }) =>
        [
            "Denoify configuration Error",
            `Expect ${name} to be ${type}, got ${param} instead`,
            "See: https://github.com/garronej/my_dummy_npm_and_deno_module"
        ].join("\n");

    const { includes } = denoifyParams;
    return {
        "replacer": parse(denoifyParams.replacer).asString().elseGet(undefined),
        "out": parse(denoifyParams.out).asString().elseGet(undefined),
        "index": parse(denoifyParams.index).asString().elseGet(undefined),
        "includes": !Array.isArray(includes)
            ? undefined
            : includes.map(
                  elem =>
                      parse(elem).asString().elseGet(undefined) ??
                      parse(elem)
                          .asMutableObject(elem => ({
                              "destDir": parse(elem.destDir).asString().elseGet(undefined),
                              "destBasename": parse(elem.destBasename).asString().elseGet(undefined),
                              "src": parse(elem.src)
                                  .asString()
                                  .elseThrow(
                                      generateErrorMessage({
                                          "type": "string",
                                          "param": elem.src,
                                          "name": "src in includes array"
                                      })
                                  )
                          }))
                          .elseThrow(
                              generateErrorMessage({
                                  "param": includes,
                                  "name": "elem in includes",
                                  "type": "object with type: { destDir: string?, destBasename: string?, src: string }"
                              })
                          )
              ),
        "ports":
            denoifyParams.ports === undefined || denoifyParams.ports === null
                ? undefined
                : Object.entries(denoifyParams.ports).reduce(
                      (prev, [portName, value]) => ({
                          ...prev,
                          [portName]: parse(value)
                              .asString()
                              .elseThrow(
                                  generateErrorMessage({
                                      "param": value,
                                      "type": "string",
                                      "name": "value of ports object"
                                  })
                              )
                      }),
                      {}
                  )
    };
}

export function parseAsDenoifyConfig({ configFileType }: { configFileType: ConfigFileType }) {
    switch (configFileType.type) {
        case "absent":
            return undefined;
        case "json": {
            const parsed = JSON.parse(configFileType.configFileRawContent);
            return parseAsDenoifyParams(configFileType.configFileBasename !== config.packageJson ? parsed : parsed.denoify);
        }
        case "js": {
            const denoifyCacheDirPath = "node_modules/.cache/denoify/cacheDirPath";
            if (!fs.existsSync(denoifyCacheDirPath)) {
                fs.mkdirSync(denoifyCacheDirPath, {
                    "recursive": true
                });
            }
            const path = `${process.cwd()}/${denoifyCacheDirPath}/config.js`;
            fs.writeFileSync(path, configFileType.configFileRawContent);
            // cosmiconfig internally uses import-fresh to parse JS config
            // import-fresh only support commonjs export, so we can use require
            return parseAsDenoifyParams(require(path));
        }
    }
}

export async function getDenoifyParamsWithCosmiconfig() {
    const explorer = cosmiconfig("denoify");
    const search = await explorer.search();
    if (search) {
        console.log(`Configurations from ${search.filepath} are used`);
    }
    return parseAsDenoifyParams(search?.config ?? undefined);
}
