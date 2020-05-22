
import { is404 } from "../tools/is404";
import { urlJoin } from "../tools/urlJoin";


export type Scheme = Scheme.GitHub | Scheme.Url;

export namespace Scheme {

    
    /** 
     * Parsed from "github:userOrOrg/repositoryName#branch" found in
     * package.json: 
     * "dependencies": {
     *     "module_name": "github:userOrOrg/repositoryName#branch"
     * }
     * 
     * The 'github:' prefix is not mandatory.
     * #branch is not mandatory ( if not specified NPM will resolve the 
     * default branch, branch that is not necessary master )
     * 
     */
    export type GitHub = {
        type: "github";
        userOrOrg: string;
        repositoryName: string;
        branch?: string;
    };

    export namespace GitHub {

        export function matchStr(strScheme: string): boolean {
            return /^(?:github:)?[^\/]+\/[^\/]+$/.test(strScheme)
        }

        //NOTE: async because need to fetch for the default branch 
        export function parse(
            strScheme: string
            // KSXGitHub/simple-js-yaml-port-for-deno or
            // github:KSXGitHub/simple-js-yaml-port-for-deno or
            // KSXGitHub/simple-js-yaml-port-for-deno#3.12.1 or
            // github:KSXGitHub/simple-js-yaml-port-for-deno#3.12.1 or
        ): GitHub {

            const match = strScheme
                .match(/^(?:github:\s*)?([^\/]*)\/([^\/]+)$/i)!
                ;

            const [repositoryName, branch] = match[2].split("#");

            return {
                "type": "github",
                "userOrOrg": match[1],
                repositoryName,
                branch
            };


        }

        export function buildUrl(
            scheme: GitHub,
            params: {
                pathToFile?: string;
                branch?: string;
            }
        ): string {

            return urlJoin(
                "https://raw.github.com",
                scheme.userOrOrg,
                scheme.repositoryName,
                params.branch ?? scheme.branch ?? "master",
                params.pathToFile ?? "mod.ts"
            );

        }

    }

    export type Url = Url.GitHub | Url.DenoLand;

    export namespace Url {

        type Common = {
            type: "url";
            baseUrlWithoutBranch: string;
            pathToIndex: string;
            branch: string;
        }

        export type GitHub = Common & {
            urlType: "github";
        };

        export namespace GitHub {

            export function matchStr(strScheme: string): boolean {
                return /^https?:\/\/raw\.github(?:usercontent)?\.com/.test(strScheme);
            }

            export function parse(
                strScheme: string
            ): GitHub {

                const match = strScheme.match(
                    /^(https?:\/\/raw\.github(?:usercontent)?\.com\/[^\/]+\/[^\/]+\/)([^\/]+)\/(.*)$/
                )!;

                return {
                    "type": "url",
                    "urlType": "github",
                    "baseUrlWithoutBranch": match[1]
                        .replace(
                            /^https?:\/\/raw\.github(?:usercontent)?/,
                            "https://raw.github"
                        )
                        .replace(/\/$/, "")
                    ,
                    "branch": match[2],
                    "pathToIndex": match[3]
                };

            }

            export function buildUrl(
                scheme: Url.GitHub,
                params: {
                    pathToFile?: string;
                    branch?: string;
                }
            ): string {

                return urlJoin(
                    scheme.baseUrlWithoutBranch.replace(/\/$/, ""),
                    params.branch ?? scheme.branch ?? "master",
                    params.pathToFile ?? scheme.pathToIndex
                );

            }


        }

        export type DenoLand = Common & {
            urlType: "deno.land";
        };

        export namespace DenoLand {

            export function matchStr(strScheme: string): boolean {
                return /^https?:\/\/deno\.land\/(?:(?:std)|(?:x))[\/|@]/.test(strScheme);
            }

            export function parse(strScheme: string): DenoLand {

                const match = /^https?:\/\/deno\.land\/std/.test(strScheme) ?
                    strScheme.match(/^(https?:\/\/deno\.land\/std)([@\/].*)$/)! :
                    strScheme.match(/^(https?:\/\/deno\.land\/x\/[^@\/]+)([@\/].*)$/)!
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
                    "type": "url",
                    "urlType": "deno.land",
                    "baseUrlWithoutBranch": match[1],
                    "branch": branch ?? "master",
                    pathToIndex
                };

            }

            export function buildUrl(
                scheme: Url.DenoLand,
                params: {
                    pathToFile?: string;
                    branch?: string;
                }
            ): string {

                const branch = params.branch ?? scheme.branch;

                return urlJoin(
                    [
                        scheme.baseUrlWithoutBranch.replace(/\/$/, ""),
                        branch !== "master" ? `@${branch}` : ""
                    ].join(""),
                    params.pathToFile ?? scheme.pathToIndex
                );

            }



        }

        export function matchStr(strScheme: string): boolean {
            return (
                GitHub.matchStr(strScheme) ||
                DenoLand.matchStr(strScheme)
            );
        }

        export function parse(strScheme: string): Scheme {
            if (GitHub.matchStr(strScheme)) {
                return GitHub.parse(strScheme);
            }
            if (DenoLand.matchStr(strScheme)) {
                return DenoLand.parse(strScheme);
            }
            throw new Error(`${strScheme} scheme not supported`);

        }

        export function buildUrl(
            scheme: Url,
            params: {
                pathToFile?: string;
                branch?: string;
            }
        ): string {

            switch (scheme.urlType) {
                case "deno.land": return DenoLand.buildUrl(scheme, params);
                case "github": return GitHub.buildUrl(scheme, params);
            }

        }

    }

    export function parse(strScheme: string): Scheme {
        if (GitHub.matchStr(strScheme)) {
            return GitHub.parse(strScheme);
        }
        if (Url.matchStr(strScheme)) {
            return Url.parse(strScheme);
        }
        throw new Error(`${strScheme} scheme not supported by Denoify`);
    }

    export function buildUrl(
        scheme: Scheme,
        params: {
            pathToFile?: string;
            branch?: string;
        }
    ): string {

        switch (scheme.type) {
            case "github": return GitHub.buildUrl(scheme, params);
            case "url": return Url.buildUrl(scheme, params);
        }

    }

    export async function resolveVersion(
        scheme: Scheme,
        params: { version: string }
    ): Promise<{
        couldConnect: true;
        scheme: Scheme;
        notTheExactVersionWarning: string | undefined;
    } | {
        couldConnect: false;
    }> {

        const { version } = params;

        const urls404: string[] = [];

        for (const branch of [
            ...["", "v"].map(prefix => `${prefix}${version}`),
            ...(!!scheme.branch ? [scheme.branch] : []),
            "master"
        ]) {

            const url = buildUrl(scheme, { branch });

            if (await is404(url)) {
                urls404.push(url);
                continue;
            }

            const notTheExactVersionWarning = ((branch ?? "").search(version) < 0) ? [
                `WARNING: Specific version ${version} could not be found\n`,
                ...urls404.map(url => `GET ${url} 404\n`),
                `Falling back to ${branch ?? "master"} branch\n`,
                `This mean that the Node and the Deno distribution of your module `,
                `will not run the same version of this dependency.`,
            ].join("") : undefined;


            const schemeOut = {
                ...scheme,
                ...(!!branch ? { branch } : {})
            };

            return {
                "couldConnect": true,
                "scheme": schemeOut,
                notTheExactVersionWarning
            };

        }

        return { "couldConnect": false };

    }


}



