import * as fs from "fs";
import { cosmiconfig } from "cosmiconfig";
import config from ".";
import { ConfigFileType } from "./fileAndContent";

const guardAsOptionalString = (string: unknown) => (typeof string === "string" ? string : undefined);

const guardAsString = (param: { string: unknown; errorMessage: string }) => {
    if (typeof param.string === "string") {
        return param.string;
    }
    throw new Error(param.errorMessage);
};

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
        "replacer": guardAsOptionalString(denoifyParams.replacer),
        "out": guardAsOptionalString(denoifyParams.out),
        "index": guardAsOptionalString(denoifyParams.index),
        "includes": !Array.isArray(includes)
            ? undefined
            : includes.map(element => {
                  const result = guardAsOptionalString(element);
                  if (result !== undefined) {
                      return result;
                  }
                  if (typeof element !== "object") {
                      throw new Error(
                          generateErrorMessage({
                              "param": includes,
                              "name": "element in includes",
                              "type": "object with type: { destDir: string?, destBasename: string?, src: string }"
                          })
                      );
                  }
                  return {
                      "destDir": guardAsOptionalString(element.destDir),
                      "destBasename": guardAsOptionalString(element.destBasename),
                      "src": guardAsString({
                          string: element.src,
                          errorMessage: generateErrorMessage({
                              "type": "string",
                              "param": element.src,
                              "name": "src in includes array"
                          })
                      })
                  };
              }),
        "ports":
            denoifyParams.ports === undefined || denoifyParams.ports === null
                ? undefined
                : Object.entries(denoifyParams.ports).reduce(
                      (prev, [portName, string]) => ({
                          ...prev,
                          [portName]: guardAsString({
                              string,
                              errorMessage: generateErrorMessage({
                                  "param": string,
                                  "type": "string",
                                  "name": "value of ports object"
                              })
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
