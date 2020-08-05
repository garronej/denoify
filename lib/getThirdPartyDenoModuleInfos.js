"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThirdPartyDenoModuleInfos = exports.thirdPartyDenoModuleNames = void 0;
const node_fetch_1 = require("node-fetch");
const addCache_1 = require("../tools/addCache");
const path = require("path");
// https://api.deno.land/modules
// https://cdn.deno.land/evt/meta/versions.json
// https://cdn.deno.land/evt/versions/v1.6.8/meta/meta.json
const limit = 100;
const listThirdPartyDenoModulesByPage = addCache_1.addCache(async (params) => {
    const { page } = params;
    const data = await node_fetch_1.default(`https://api.deno.land/modules?limit=${limit}&page=${page}`)
        .then(async (res) => JSON.parse(await res.text())["data"]);
    const { total_count, results } = data;
    return {
        total_count,
        "names": results.map(({ name }) => name)
    };
}, {
    "filePathForPersistanceAcrossRun": path.join(__dirname, "..", "..", "res", "cache", "listThirdPartyDenoModulesByPage.json")
});
async function* thirdPartyDenoModuleNames() {
    let total_count = undefined;
    const getLastPage = (params) => Math.floor(params.total_count / limit) + 1;
    let page = 1;
    while (total_count === undefined || page <= getLastPage({ total_count })) {
        const result = await listThirdPartyDenoModulesByPage({ page });
        if (total_count === undefined) {
            total_count = result.total_count;
        }
        for (const name of result.names) {
            yield name;
        }
        page++;
    }
    return undefined;
}
exports.thirdPartyDenoModuleNames = thirdPartyDenoModuleNames;
exports.getThirdPartyDenoModuleInfos = addCache_1.addCache(async (params) => {
    const { denoModuleName } = params;
    const latestVersion = await node_fetch_1.default(`https://cdn.deno.land/${denoModuleName}/meta/versions.json`)
        .then(async (res) => !/^2[0-9]{2}$/.test(`${res.status}`) ?
        undefined :
        JSON.parse(await res.text())["latest"]);
    if (latestVersion === undefined) {
        return undefined;
    }
    const repository = await node_fetch_1.default(`https://cdn.deno.land/${denoModuleName}/versions/${latestVersion}/meta/meta.json`)
        .then(async (res) => !/^2[0-9]{2}$/.test(`${res.status}`) ?
        undefined :
        JSON.parse(await res.text())["upload_options"])
        .then(infos => infos === undefined ?
        undefined :
        infos.type !== "github" ?
            undefined : infos.repository);
    if (repository === undefined) {
        return undefined;
    }
    const [owner, repo] = repository.split("/");
    return { owner, repo, latestVersion };
}, {
    "filePathForPersistanceAcrossRun": path.join(__dirname, "..", "..", "res", "cache", "getThirdPartyDenoModuleInfos.json")
});
//# sourceMappingURL=getThirdPartyDenoModuleInfos.js.map