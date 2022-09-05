import { cosmiconfig } from "cosmiconfig";
import * as YAML from "yaml";
import * as fs from "fs";

type DenoifyParams = {
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

type ConfigFileType =
    | {
          type: "absent";
      }
    | {
          type: "json" | "js" | "yaml" | "extensionless";
          file: string;
          config: string;
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

function parseAsDenoifyParams(denoifyParams: any): DenoifyParams | undefined {
    if (denoifyParams === undefined) {
        return undefined;
    }
    const { includes } = denoifyParams;
    return {
        replacer: parseAsStringElseUndefined(denoifyParams.replacer),
        out: parseAsStringElseUndefined(denoifyParams.out),
        index: parseAsStringElseUndefined(denoifyParams.index),
        includes: !Array.isArray(includes)
            ? undefined
            : includes.map(elem =>
                  typeof elem === "string"
                      ? elem
                      : {
                            destDir: parseAsStringElseUndefined(elem.destDir),
                            destBasename: parseAsStringElseUndefined(elem.destBasename),
                            src: parseAsStringElseThrow({
                                param: elem.src,
                                type: "src in includes array"
                            })
                        }
              ),
        ports:
            denoifyParams.ports !== undefined || denoifyParams.ports !== null
                ? undefined
                : Object.entries(denoifyParams.ports).reduce(
                      (prev, [portName, value]) => ({
                          ...prev,
                          [portName]: parseAsStringElseThrow({
                              param: value,
                              type: "value of ports object"
                          })
                      }),
                      {}
                  )
    };
}

export function configuration() {
    const packageJson = "package.json";
    const supportedConfigFile = (() => {
        const denoify = "denoify";
        const rcs = ["", ".json", ".yaml", ".yml"];
        const configs = [".js", ".cjs"];
        // in order of precedence
        return [packageJson].concat(
            rcs.concat(configs).map(extension => `.${denoify}rc${extension}`),
            configs.map(extension => `${denoify}.config${extension}`)
        );
    })();

    function parseConfig({ file, config }: { file: string | undefined; config: string | undefined }): ConfigFileType {
        if (file === undefined || config === undefined) {
            return {
                type: "absent"
            };
        }
        if (file.endsWith(".json")) {
            return {
                type: "json",
                file,
                config
            };
        } else if (file.split(".").length === 2) {
            return {
                type: "extensionless",
                file,
                config
            };
        } else if (file.endsWith(".cjs") || file.endsWith(".js")) {
            return {
                type: "js",
                file,
                config
            };
        } else if (file.endsWith(".yaml") || file.endsWith(".yml")) {
            return {
                type: "yaml",
                file,
                config
            };
        } else {
            return {
                type: "absent"
            };
        }
    }

    return {
        getFileTypeAndContent(content: (file: string) => Promise<string | undefined>) {
            return supportedConfigFile.reduce(async (configFileType, file) => {
                if ((await configFileType).type !== "absent") {
                    return configFileType;
                } else {
                    const config = await content(file);
                    if (!config) {
                        return configFileType;
                    } else if (file !== packageJson) {
                        return parseConfig({
                            file,
                            config
                        });
                    } else if (!YAML.parse(config).denoify) {
                        return configFileType;
                    } else {
                        return parseConfig({
                            file,
                            config
                        });
                    }
                }
            }, Promise.resolve({ type: "absent" }) as Promise<ConfigFileType>);
        },
        parseAsDenoifyConfig(configFileType: ConfigFileType) {
            switch (configFileType.type) {
                case "absent":
                    return undefined;
                case "json":
                case "yaml":
                case "extensionless":
                    // yaml is a superset of json
                    const parsed = YAML.parse(configFileType.config);
                    return parseAsDenoifyParams(configFileType.file !== packageJson ? parsed : parsed.denoify);
                case "js": {
                    const denoify = `${process.cwd()}/node_modules/.cache/denoify`;
                    if (!fs.existsSync(denoify)) {
                        fs.mkdir(denoify, error => {
                            if (error) {
                                console.error(error);
                            }
                        });
                    }
                    const path = `${denoify}/config.js`;
                    fs.writeFileSync(path, configFileType.config);
                    // cosmiconfig internally uses import-fresh to parse JS config
                    // import-fresh only support commonjs export, so we can use require
                    return parseAsDenoifyParams(require(path));
                }
            }
        }
    };
}

export async function getDenoifyParamsWithCosmiconfig() {
    const explorer = cosmiconfig("denoify");
    const search = await explorer.search();
    if (search) {
        console.log(`Configurations from ${search.filepath} are used`);
    }
    return parseAsDenoifyParams(search?.config ?? undefined);
}
