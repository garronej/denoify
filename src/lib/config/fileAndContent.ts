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

/**
 * Identifies the source and type of a configuration file.
 *
 * All this does is determines whether the file is supported (by filename) and whether it is valid JSON
 */
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

/**
 * Determines the file type (js or json) and content of a file, given a method to retrieve that files contents. This allows us to access content that is
 * local or remote
 *
 * @param param0.getConfigFileRawContent - a function that, given a path to a configuration file, returns the raw contents of that file as a string
 */
export function getFileTypeAndContent({
    getConfigFileRawContent
}: {
    getConfigFileRawContent: (configFileBasename: string) => Promise<string | undefined>;
}): Promise<ConfigFileType> {
    // eslint-disable-next-line max-params -- we're bound by the required signature of a reduce function
    return config.supportedConfigFile.reduce<Promise<ConfigFileType>>(async (configFileType, configFileBasename) => {
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
    }, Promise.resolve({ type: "absent" } satisfies ConfigFileType));
}
