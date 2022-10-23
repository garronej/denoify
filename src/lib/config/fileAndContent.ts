import config from ".";

export type ConfigFileType =
    | {
          type: "absent";
      }
    | {
          type: "js" | "json";
          configFileBasename: string;
          configFileRawContent: string;
      };

function tryParseAsJson(content: string) {
    try {
        return JSON.parse(content);
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
    if (configFileBasename.endsWith(".json") && tryParseAsJson(configFileRawContent)) {
        return {
            type: "json",
            configFileBasename,
            configFileRawContent
        };
    }
    if (configFileBasename.endsWith(".js")) {
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
        if (!configFileRawContent || (configFileBasename === config.packageJson && !tryParseAsJson(configFileRawContent)?.denoify)) {
            return configFileType;
        }
        return parseConfig({
            configFileBasename,
            configFileRawContent
        });
    }, Promise.resolve({ type: "absent" }) as Promise<ConfigFileType>);
}
