import { cosmiconfig } from "cosmiconfig";
import { parseAsDenoifyParams } from "./parseParams";

const config = (() => {
    const packageJson = "package.json";
    return {
        packageJson,
        "supportedConfigFile": [packageJson, ...["json", "js"].map(extension => `denoify.config.${extension}`)],
        "getDenoifyParamsWithCosmiconfig": async () => {
            const explorer = cosmiconfig("denoify");
            const search = await explorer.search();
            if (search) {
                console.log(`Configurations from ${search.filepath} are used`);
            }
            return parseAsDenoifyParams(search?.config ?? undefined);
        }
    } as const;
})();

export default config;
