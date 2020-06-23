
import { is404 } from "../tools/is404";
import { urlJoin } from "../tools/urlJoin";
import { getGithubDefaultBranchName } from "get-github-default-branch-name";
import { getDenoThirdPartyModuleDatabase } from "./denoThirdPartyModuleDb";
import fetch from "node-fetch";
import * as commentJson from "comment-json";
import * as path from "path";
import { addCache } from "../tools/addCache";
import { getCurrentStdVersion } from "./getCurrentStdVersion";


export type ModuleAddress =
    ModuleAddress.GitHubRepo |
    ModuleAddress.GitHubRawUrl |
    ModuleAddress.DenoLandUrl
    ;

export namespace ModuleAddress {

    /** e.g: "github:userOrOrg/repositoryName#branch" */
    export type GitHubRepo = {
        type: "GITHUB REPO";
        userOrOrg: string;
        repositoryName: string;
        branch?: string;
    };

    export namespace GitHubRepo {
        /**
         * Input example 
         * KSXGitHub/simple-js-yaml-port-for-deno or
         * github:KSXGitHub/simple-js-yaml-port-for-deno or
         * KSXGitHub/simple-js-yaml-port-for-deno#3.12.1 or
         * github:KSXGitHub/simple-js-yaml-port-for-deno#3.12.1 or
         */
        export function parse(
            raw: string
        ): GitHubRepo {

            const match = raw.match(/^(?:github:\s*)?([^\/]*)\/([^\/]+)$/i)!;

            const [repositoryName, branch] = match[2].split("#");

            return {
                "type": "GITHUB REPO",
                "userOrOrg": match[1],
                repositoryName,
                branch
            };
        }

        /** Match valid parse input */
        export function match(raw: string): boolean {
            return /^(?:github:)?[^\/]+\/[^\/]+$/.test(raw);
        }
    }

    /** https://raw.githubusercontent.com/user/repo/branch/path/to/file.ts */
    export type GitHubRawUrl = {
        type: "GITHUB-RAW URL"
        baseUrlWithoutBranch: string;
        pathToIndex: string;
        branch: string;
    };

    export namespace GitHubRawUrl {

        export function parse(raw: string): GitHubRawUrl {

            const match = raw.match(
                /^(https?:\/\/raw\.github(?:usercontent)?\.com\/[^\/]+\/[^\/]+\/)([^\/]+)\/(.*)$/
            )!;

            return {
                "type": "GITHUB-RAW URL",
                "baseUrlWithoutBranch": match[1]
                    .replace(
                        /^https?:\/\/raw\.github(?:usercontent)?/,
                        "https://raw.githubusercontent"
                    )
                    .replace(/\/$/, "")
                ,
                "branch": match[2],
                "pathToIndex": match[3]
            };

        }

        export function match(raw: string): boolean {
            return /^https?:\/\/raw\.github(?:usercontent)?\.com/.test(raw);
        }

    }

    /** e.g: https://deno.land/x/foo@1.2.3/mod.js */
    export type DenoLandUrl = {
        type: "DENO.LAND URL"
        isStd: boolean;
        baseUrlWithoutBranch: string;
        pathToIndex: string;
        branch?: string;
    };

    export namespace DenoLandUrl {

        export function parse(raw: string): DenoLandUrl {

            const isStd = /^https?:\/\/deno\.land\/std/.test(raw);

            const match = isStd ?
                raw.match(/^(https?:\/\/deno\.land\/std)([@\/].*)$/)! :
                raw.match(/^(https?:\/\/deno\.land\/x\/[^@\/]+)([@\/].*)$/)!
                ;

            // https://deno.land/std@master/node/querystring.ts
            // [1]: https://deno.land/std
            // [2]: @master/node/querystring.ts

            // https://deno.land/std/node/querystring.ts
            // [1]: https://deno.land/std
            // [2]: /node/querystring.ts

            //https://deno.land/x/foo@1.2.3/mod.js
            // [1]: https://deno.land/x/foo
            // [2]: @1.2.3/mod.js

            //https://deno.land/x/foo/mod.js
            // [1]: https://deno.land/x/foo
            // [2]: /mod.js

            const { branch, pathToIndex } = match[2].startsWith("@") ? (() => {

                const [
                    , branch, // 1.2.3
                    pathToIndex // mod.js
                ] = match[2].match(/^@([^\/]+)\/(.*)$/)!;

                return { branch, pathToIndex }

            })() : ({
                "branch": undefined,
                "pathToIndex": match[2].replace(/^\//, "") // mod.js
            });

            return {
                "type": "DENO.LAND URL",
                isStd,
                "baseUrlWithoutBranch": match[1],
                "branch": branch,
                pathToIndex
            };

        }

        export function match(raw: string): boolean {
            return /^https?:\/\/deno\.land\/(?:(?:std)|(?:x))[\/|@]/.test(raw);
        }
    }

    export function parse(raw: string): ModuleAddress {

        for (const ns of [GitHubRepo, GitHubRawUrl, DenoLandUrl]) {

            if (!ns.match(raw)) {
                continue;
            }

            return ns.parse(raw);

        }

        throw new Error(`${raw} is not a valid module address`);


    }

    /** 
     * Perform no check, just synchronously assemble the url 
     * from a ModuleAddress, a branch and a path to file.
     * */
    function buildUrlFactory(params: { moduleAddress: ModuleAddress; }){
        const { moduleAddress } = params;

        const buildUrl = ((): ((
            candidateBranch: string, //e.g: deno_latest
            pathToFile?: string //e.g: tools/typeSafety/assert.ts
        ) => string) => {
            switch (moduleAddress.type) {
                case "GITHUB REPO":
                    return (candidateBranch, pathToFile) => urlJoin(
                        "https://raw.githubusercontent.com",
                        moduleAddress.userOrOrg,
                        moduleAddress.repositoryName,
                        candidateBranch,
                        pathToFile ?? "mod.ts"
                    );
                case "DENO.LAND URL":
                    return (candidateBranch, pathToFile) => urlJoin(
                        [
                            moduleAddress.baseUrlWithoutBranch.replace(/\/$/, ""),
                            `@${candidateBranch}`
                        ].join(""),
                        pathToFile ?? moduleAddress.pathToIndex
                    );
                case "GITHUB-RAW URL":
                    return (candidateBranch, pathToFile) => urlJoin(
                        moduleAddress.baseUrlWithoutBranch.replace(/\/$/, ""),
                        candidateBranch,
                        pathToFile ?? moduleAddress.pathToIndex
                    );
            }
        })();
        return { buildUrl };
    }

    async function* candidateBranches(
        params: getValidImportUrlFactory.Params
    ): AsyncGenerator<[string, false | { version: string; }]> {

        const { moduleAddress } = params;

        let fallback: false | { version: string; } = false;

        if( moduleAddress.type === "DENO.LAND URL" && moduleAddress.isStd ){

            yield [await getCurrentStdVersion(), fallback];

            return undefined;

        }

        if ( params.desc === "MATCH VERSION INSTALLED IN NODE_MODULE") {
            const { version } = params;
            yield [version, fallback];
            yield ["v" + version, fallback];

            fallback = { version };

        }

        if (moduleAddress.branch !== undefined) {
            yield [moduleAddress.branch, fallback];
        }

        switch (moduleAddress.type) {
            case "GITHUB REPO":

                walk: {

                    const database = await getDenoThirdPartyModuleDatabase();

                    const entry = Object.keys(database)
                        .map(moduleName => database[moduleName])
                        .find(({ owner, repo }) => (
                            owner === moduleAddress.userOrOrg &&
                            repo === moduleAddress.repositoryName
                        ))
                        ;

                    if (entry === undefined) {
                        break walk;
                    }

                    yield [entry.default_version, fallback];

                }


                yield ["deno_latest", fallback];


                yield [
                    await getGithubDefaultBranchName({
                        "owner": moduleAddress.userOrOrg,
                        "repo": moduleAddress.repositoryName
                    }),
                    fallback
                ]

                break;
            case "GITHUB-RAW URL":
                //NOTE: Always a branch specified that should prevail.
                break;
            case "DENO.LAND URL":
                if (moduleAddress.branch !== undefined) {
                    break;
                }

                if (moduleAddress.isStd) {

                    yield [
                        await getGithubDefaultBranchName({
                            "owner": "denoland",
                            "repo": "deno"
                        }),
                        fallback
                    ];

                } else {

                    const default_version =
                        await getDenoThirdPartyModuleDatabase()
                            .then(
                                database => database[
                                    moduleAddress.baseUrlWithoutBranch.split("/").reverse()[0]
                                ]?.default_version
                            );


                    if (default_version === undefined) {
                        break;
                    }

                    yield [
                        default_version,
                        fallback
                    ];

                }

                break;
        }
    }

    async function resolveVersion(params: getValidImportUrlFactory.Params) {

        const { buildUrl } = buildUrlFactory({ "moduleAddress": params.moduleAddress });

        for await (const [candidateBranch, fallback] of candidateBranches(params)) {

            const url = buildUrl(candidateBranch);

            if (await is404(url)) {
                continue;
            }

            return {
                "branchForVersion": candidateBranch,
                "versionFallbackWarning": !fallback ?
                    undefined :
                    `Can't match ${fallback.version}, falling back to ${candidateBranch} branch`


            };


        }

        return undefined;




    }

    async function isDenoified(
        params: {
            moduleAddress: ModuleAddress;
            branchForVersion: string;
        }
    ): Promise<boolean> {

        const { moduleAddress, branchForVersion } = params;
        const { buildUrl } = buildUrlFactory({ moduleAddress });

        let modTsRaw: string;

        try {

            modTsRaw = await fetch(buildUrl(branchForVersion))
                .then(res => res.text())
                ;

        } catch{


            return false;

        }

        if (!modTsRaw.match(/denoify/i)) {


            return false;
        }


        return true;


    }

    /** Asserts denoified module */
    async function getTsconfigOutDir(
        params: {
            moduleAddress: ModuleAddress;
            branchForVersion: string;
        }
    ): Promise<string> {

        const { branchForVersion, moduleAddress } = params;

        const { buildUrl } = buildUrlFactory({ moduleAddress });

        return path.normalize(
            commentJson.parse(
                await fetch(
                    buildUrl(
                        branchForVersion,
                        "tsconfig.json"
                    )
                ).then(res => res.text())
            )["compilerOptions"]["outDir"]
        )
            ;
    };

    export type GetValidImportUrl = (params: {
        target: "DEFAULT EXPORT";
    } | {
        target: "SPECIFIC FILE";
        specificImportPath: string; // e.g tools/typeSafety ( no .ts ext )
    }) => Promise<string>;

    export namespace getValidImportUrlFactory {

        export type Params =
            {
                moduleAddress: ModuleAddress;
            } & ({
                desc: "NO SPECIFIC VERSION PRESENT IN NODE_MODULE ( PROBABLY NODE BUILTIN)";
            } | {
                desc: "MATCH VERSION INSTALLED IN NODE_MODULE";
                version: string
            })
            ;

        export type Result = {
            couldConnect: false;
        } | {
            couldConnect: true;
            versionFallbackWarning: string | undefined;
            isDenoified: boolean;
            getValidImportUrl: GetValidImportUrl;
        };

    }


    export const getValidImportUrlFactory = addCache(async (
        params: getValidImportUrlFactory.Params
    ): Promise<getValidImportUrlFactory.Result> => {

        const { moduleAddress } = params;

        const { buildUrl } = buildUrlFactory({ moduleAddress });

        const versionResolutionResult = await resolveVersion(params);


        if (versionResolutionResult === undefined) {

            return { "couldConnect": false };

        }

        const { branchForVersion, versionFallbackWarning } = versionResolutionResult;


        const tsconfigOutDir = await (async () => {

            if (!(await isDenoified({ moduleAddress, branchForVersion }))) {
                return undefined;
            }

            return getTsconfigOutDir({ branchForVersion, moduleAddress });

        })();

        const getValidImportUrl: GetValidImportUrl = async params => {

            if (params.target === "DEFAULT EXPORT") {

                return buildUrl(branchForVersion);

            }

            const { specificImportPath } = params;

            for (const fixedTsConfigOutDir of [
                !tsconfigOutDir ? "dist" : tsconfigOutDir.replace(/\\/g, "/"),
                undefined
            ]) {

                let url = buildUrl(
                    branchForVersion,
                    (fixedTsConfigOutDir === undefined ?
                        specificImportPath
                        :
                        path.posix.join(
                            path.posix.join(
                                path.posix.dirname(fixedTsConfigOutDir), // .
                                `deno_${path.posix.basename(fixedTsConfigOutDir)}`//deno_dist
                            ), // deno_dist
                            path.posix.relative(
                                fixedTsConfigOutDir,
                                specificImportPath // dest/tools/typeSafety
                            ) //  tools/typeSafety
                        ) // deno_dist/tool/typeSafety
                    ) + ".ts" // deno_dist/tool/typeSafety.ts
                )


                walk: {

                    if (await is404(url)) {
                        break walk;
                    }

                    return url;

                }

                url = url
                    .replace(/\.ts$/, "/index.ts")
                    // https://.../deno_dist/tool/typeSafety/index.ts
                    ;

                walk: {

                    if (await is404(url)) {
                        break walk;
                    }

                    return url;

                }

            }

            throw new Error(`Can't locate ${specificImportPath}`);
        };

        return {
            "couldConnect": true,
            versionFallbackWarning,
            "isDenoified": tsconfigOutDir !== undefined,
            "getValidImportUrl": addCache(getValidImportUrl)
        }

    });

}
