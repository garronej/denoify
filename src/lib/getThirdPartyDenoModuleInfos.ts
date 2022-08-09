import fetch from "node-fetch";
import { addCache } from "../tools/addCache";

// https://api.deno.land/modules
// https://cdn.deno.land/evt/meta/versions.json
// https://cdn.deno.land/evt/versions/v1.6.8/meta/meta.json

export const getThirdPartyDenoModuleInfos = addCache(
    async (params: {
        denoModuleName: string;
    }): Promise<
        | {
              owner: string;
              repo: string;
              latestVersion: string;
              subdir: string;
          }
        | undefined
    > => {
        const { denoModuleName } = params;

        const latestVersion = await fetch(`https://cdn.deno.land/${denoModuleName}/meta/versions.json`).then(async res =>
            !/^2[0-9]{2}$/.test(`${res.status}`) ? undefined : (JSON.parse(await res.text())["latest"] as string)
        );

        if (latestVersion === undefined) {
            return undefined;
        }

        const infos = await fetch(`https://cdn.deno.land/${denoModuleName}/versions/${latestVersion}/meta/meta.json`).then(async res =>
            !/^2[0-9]{2}$/.test(`${res.status}`)
                ? undefined
                : (JSON.parse(await res.text())["upload_options"] as { type: string; repository: string; subdir?: string })
        );

        if (infos?.type !== "github") {
            return undefined;
        }

        if (infos.repository === undefined) {
            return undefined;
        }

        const [owner, repo] = infos.repository.split("/");

        return {
            owner,
            repo,
            latestVersion,
            "subdir": infos.subdir ?? "/"
        };
    }
);
