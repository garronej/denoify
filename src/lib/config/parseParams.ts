import * as fs from "fs";
import * as YAML from "yaml";
import { cosmiconfig } from "cosmiconfig";
import config from ".";
import { ConfigFileType } from "./fileAndContent";

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

function parseAsStringElseUndefined(param: unknown) {
    return typeof param === "string" ? param : undefined;
}

function parseAsStringElseThrow({ param, type }: { param: unknown; type: string }) {
    if (typeof param === "string") {
        return param;
    }
    throw new Error(
        [
            "Denoify configuration Error",
            `Expect ${type} to be string, got ${param} instead`,
            "See: https://github.com/garronej/my_dummy_npm_and_deno_module"
        ].join("\n")
    );
}

export function parseAsDenoifyParams(denoifyParams: any): DenoifyParams | undefined {
    if (denoifyParams === undefined) {
        return undefined;
    }
    const { includes } = denoifyParams;
    return {
        "replacer": parseAsStringElseUndefined(denoifyParams.replacer),
        "out": parseAsStringElseUndefined(denoifyParams.out),
        "index": parseAsStringElseUndefined(denoifyParams.index),
        "includes": !Array.isArray(includes)
            ? undefined
            : includes.map(elem =>
                  typeof elem === "string"
                      ? elem
                      : {
                            "destDir": parseAsStringElseUndefined(elem.destDir),
                            "destBasename": parseAsStringElseUndefined(elem.destBasename),
                            "src": parseAsStringElseThrow({
                                "param": elem.src,
                                "type": "src in includes array"
                            })
                        }
              ),
        "ports":
            denoifyParams.ports !== undefined || denoifyParams.ports !== null
                ? undefined
                : Object.entries(denoifyParams.ports).reduce(
                      (prev, [portName, value]) => ({
                          ...prev,
                          [portName]: parseAsStringElseThrow({
                              "param": value,
                              "type": "value of ports object"
                          })
                      }),
                      {}
                  )
    };
}

export function parseAsDenoifyConfig({ configFileType }: { configFileType: ConfigFileType }) {
    switch (configFileType.type) {
        case "absent":
            return undefined;
        case "yaml": {
            const parsed = YAML.parse(configFileType.configFileRawContent);
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
