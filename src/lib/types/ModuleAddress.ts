export type ModuleAddress = ModuleAddress.GitHubRepo | ModuleAddress.GitHubRawUrl | ModuleAddress.DenoLandUrl;

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
        export function parse(raw: string): GitHubRepo {
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
            return /^(?:github:)?[^\/\:]+\/[^\/]+$/.test(raw);
        }
    }

    /** https://raw.githubusercontent.com/user/repo/branch/path/to/file.ts */
    export type GitHubRawUrl = {
        type: "GITHUB-RAW URL";
        baseUrlWithoutBranch: string;
        pathToIndex: string;
        branch: string;
    };

    export namespace GitHubRawUrl {
        export function parse(raw: string): GitHubRawUrl {
            const match = raw.match(/^(https?:\/\/raw\.github(?:usercontent)?\.com\/[^\/]+\/[^\/]+\/)([^\/]+)\/(.*)$/)!;

            return {
                "type": "GITHUB-RAW URL",
                "baseUrlWithoutBranch": match[1]
                    .replace(/^https?:\/\/raw\.github(?:usercontent)?/, "https://raw.githubusercontent")
                    .replace(/\/$/, ""),
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
        type: "DENO.LAND URL";
        isStd: boolean;
        baseUrlWithoutBranch: string;
        pathToIndex: string;
        branch?: string;
    };

    export namespace DenoLandUrl {
        export function parse(raw: string): DenoLandUrl {
            const isStd = /^https?:\/\/deno\.land\/std/.test(raw);

            const match = isStd
                ? raw.match(/^(https?:\/\/deno\.land\/std)([@\/].*)$/)!
                : raw.match(/^(https?:\/\/deno\.land\/x\/[^@\/]+)([@\/].*)$/)!;
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

            const { branch, pathToIndex } = match[2].startsWith("@")
                ? (() => {
                      const [
                          ,
                          branch, // 1.2.3
                          pathToIndex // mod.js
                      ] = match[2].match(/^@([^\/]+)\/(.*)$/)!;

                      return { branch, pathToIndex };
                  })()
                : {
                      "branch": undefined,
                      "pathToIndex": match[2].replace(/^\//, "") // mod.js
                  };

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
}
