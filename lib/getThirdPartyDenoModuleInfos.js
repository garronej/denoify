"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThirdPartyDenoModuleInfos = void 0;
const node_fetch_1 = require("node-fetch");
const addCache_1 = require("../tools/addCache");
// https://api.deno.land/modules
// https://cdn.deno.land/evt/meta/versions.json
// https://cdn.deno.land/evt/versions/v1.6.8/meta/meta.json
exports.getThirdPartyDenoModuleInfos = addCache_1.addCache(async (params) => {
    var _a;
    const { denoModuleName } = params;
    const latestVersion = await node_fetch_1.default(`https://cdn.deno.land/${denoModuleName}/meta/versions.json`)
        .then(async (res) => !/^2[0-9]{2}$/.test(`${res.status}`) ?
        undefined :
        JSON.parse(await res.text())["latest"]);
    if (latestVersion === undefined) {
        return undefined;
    }
    const infos = await node_fetch_1.default(`https://cdn.deno.land/${denoModuleName}/versions/${latestVersion}/meta/meta.json`)
        .then(async (res) => !/^2[0-9]{2}$/.test(`${res.status}`) ?
        undefined :
        JSON.parse(await res.text())["upload_options"]);
    if ((infos === null || infos === void 0 ? void 0 : infos.type) !== "github") {
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
        "subdir": (_a = infos.subdir) !== null && _a !== void 0 ? _a : "/"
    };
});
//# sourceMappingURL=getThirdPartyDenoModuleInfos.js.map