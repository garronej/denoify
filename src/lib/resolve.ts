
import * as st from "scripting-tools";
import * as path from "path";
import { is404 } from "../tools/is404";
import { urlJoin } from "../tools/urlJoin";
import fetch from "node-fetch";
import * as commentJson from "comment-json";
import { id } from "../tools/id";

export type ResolveResult = {
    type: "PORT";
    url: string;
} | {
    type: "CROSS COMPATIBLE";
    baseUrl: string;
    tsconfigOutDir: string;
} | {
    type: "UNMET";
    kind: "DEV DEPENDENCY" | "STANDARD"
};

export function resolveFactory(
    params: {
        projectPath: string;
        denoPorts: { [nodeModuleName: string]: string; };
        devDependencies: { [nodeModuleName: string]: string; };
        dependencies: { [nodeModuleName: string]: string; }
    }
) {

    const { denoPorts } = params;

    const allDependencies = {
        ...params.dependencies,
        ...params.devDependencies
    };

    const devDependenciesNames = Object.keys(params.devDependencies);

    const getTargetModulePath = (nodeModuleName: string) =>
        st.find_module_path(
            nodeModuleName,
            params.projectPath
        );

    const resolve = async (
        params: { nodeModuleName: string }
    ): Promise<ResolveResult> => {

        const { nodeModuleName } = params;

        {
            const url = denoPorts[nodeModuleName];

            if (url !== undefined) {
                return {
                    "type": "PORT",
                    url
                }
            }

        }

        if (!(nodeModuleName in allDependencies)) {

            return {
                "type": "UNMET",
                "kind": "STANDARD"
            }

        }

        const targetModulePath = getTargetModulePath(nodeModuleName);

        const packageJsonParsed = require(path.join(targetModulePath, "package.json"));


        const getBaseUrlParams = (() => {

            {

                const matchedArray = allDependencies[nodeModuleName]
                    .match(/^(?:github:\s*)?([^\/]*)\/([^\/]+)$/i)
                    ;

                if (!!matchedArray) {

                    const [repositoryName, branch] = matchedArray[2].split("#");

                    return id<Parameters<typeof getBaseUrl>[0][]>([
                        {
                            "branch": branch ?? "master",
                            "userOrOrg": matchedArray[1],
                            repositoryName
                        }
                    ]);

                }

            }

            const repositoryUrl = packageJsonParsed?.["repository"]?.["url"];

            if (!repositoryUrl) {
                return undefined;
            }

            const [repositoryName, userOrOrg] =
                repositoryUrl
                    .replace(/\.git$/i, "")
                    .split("/")
                    .filter((s: string) => !!s)
                    .reverse()
                ;

            if (!repositoryName || !userOrOrg) {
                return undefined;
            }

            return ["v", ""].map<Parameters<typeof getBaseUrl>[0]>(
                prefix => ({

                    "branch": `${prefix}${packageJsonParsed["version"]}`,
                    userOrOrg,
                    repositoryName
                }))

        })();

        function onUnmetDevDependencyOrError(nodeModuleName: string, errorMessage: string): ResolveResult {

            //TODO: factorize
            if (devDependenciesNames.includes(nodeModuleName)) {

                return {
                    "type": "UNMET",
                    "kind": "DEV DEPENDENCY"
                }

            }

            throw new Error(errorMessage);

        }

        if (!getBaseUrlParams) {

            return onUnmetDevDependencyOrError(
                nodeModuleName,
                `Can't find the ${nodeModuleName} github repository`
            );

        }

        const baseUrl = (await Promise.all(getBaseUrlParams.map(getBaseUrl)))
            .find(baseUrl => !!baseUrl)
            ;

        if (!baseUrl) {

            return onUnmetDevDependencyOrError(
                nodeModuleName,
                `${nodeModuleName} v${packageJsonParsed["version"]} do not have a github release`
            );

        }

        const hasBeenDenoified = await (async () => {

            let modTsRaw: string;

            try {

                modTsRaw = await fetch(urlJoin(baseUrl, "mod.ts"))
                    .then(res => res.text())
                    ;

            } catch{

                return false;

            }

            if (!modTsRaw.match(/denoify/i)) {
                return false;
            }

            return true;


        })();

        if (!hasBeenDenoified) {

            return onUnmetDevDependencyOrError(
                nodeModuleName,
                `${nodeModuleName} do not seems to have been denoified`
            );

        }

        return {
            "type": "CROSS COMPATIBLE",
            baseUrl,
            "tsconfigOutDir":

                commentJson.parse(
                    await fetch(urlJoin(baseUrl, "tsconfig.ts"))
                        .then(res => res.text())
                )
                ["compilerOptions"]
                ["outDir"]
        };


    };

    return { resolve };

}

//https://raw.githubusercontent.com/garronej/run_exclusive/v2.1.11/package.json
async function getBaseUrl(params: {
    branch: string;
    userOrOrg: string;
    repositoryName: string;
}): Promise<string | undefined> {

    const { branch, userOrOrg, repositoryName } = params;

    const url = [
        `https://raw.githubusercontent.com`,
        userOrOrg,
        repositoryName,
        branch
    ].join("/")

    if (await is404(urlJoin(url, "mod.ts"))) {
        return undefined;
    }

    return url;

}