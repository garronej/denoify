import * as YAML from "yaml";
import config from ".";

export type ConfigFileType =
    | {
          type: "absent";
      }
    | {
          // yaml is superset of json, we can treat it as yaml instead
          type: "js" | "yaml";
          configFileBasename: string;
          configFileRawContent: string;
      };

function tryParseAsYamlCompatible(content: string) {
    try {
        return YAML.parse(content);
    } catch {
        return undefined;
    }
}

function parseConfig({
    configFileBasename,
    configFileRawContent
}: {
    configFileBasename: string | undefined;
    configFileRawContent: string | undefined;
}): ConfigFileType {
    if (
        configFileBasename === undefined ||
        configFileRawContent === undefined ||
        !config.supportedConfigFile.find(configFile => configFileBasename.endsWith(configFile))
    ) {
        return {
            type: "absent"
        };
    }
    if (
        (configFileBasename === ".denoifyrc" ||
            configFileBasename.endsWith(".json") ||
            configFileBasename.endsWith(".yaml") ||
            configFileBasename.endsWith(".yml")) &&
        tryParseAsYamlCompatible(configFileRawContent)
    ) {
        return {
            type: "yaml",
            configFileBasename,
            configFileRawContent
        };
    }
    if (configFileBasename.endsWith(".cjs") || configFileBasename.endsWith(".js")) {
        return {
            type: "js",
            configFileBasename,
            configFileRawContent
        };
    }
    return {
        type: "absent"
    };
}

export default function getFileTypeAndContent({
    getConfigFileRawContent
}: {
    getConfigFileRawContent: (configFileBasename: string) => Promise<string | undefined>;
}) {
    return config.supportedConfigFile.reduce(async (configFileType, configFileBasename) => {
        if ((await configFileType).type !== "absent") {
            return configFileType;
        }
        const configFileRawContent = await getConfigFileRawContent(configFileBasename);
        if (!configFileRawContent || (configFileBasename === config.packageJson && !tryParseAsYamlCompatible(configFileRawContent)?.denoify)) {
            return configFileType;
        }
        return parseConfig({
            configFileBasename,
            configFileRawContent
        });
    }, Promise.resolve({ type: "absent" }) as Promise<ConfigFileType>);
}
