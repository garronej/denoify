export declare type Scheme = Scheme.GitHub | Scheme.Url;
export declare namespace Scheme {
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
    type GitHub = {
        type: "github";
        userOrOrg: string;
        repositoryName: string;
        branch?: string;
    };
    namespace GitHub {
        function matchStr(strScheme: string): boolean;
        function parse(strScheme: string): GitHub;
        function buildUrl(scheme: GitHub, params: {
            pathToFile?: string;
            branch?: string;
        }): string;
    }
    type Url = Url.GitHub | Url.DenoLand;
    namespace Url {
        type Common = {
            type: "url";
            baseUrlWithoutBranch: string;
            pathToIndex: string;
            branch: string;
        };
        export type GitHub = Common & {
            urlType: "github";
        };
        export namespace GitHub {
            function matchStr(strScheme: string): boolean;
            function parse(strScheme: string): GitHub;
            function buildUrl(scheme: Url.GitHub, params: {
                pathToFile?: string;
                branch?: string;
            }): string;
        }
        export type DenoLand = Common & {
            urlType: "deno.land";
        };
        export namespace DenoLand {
            function matchStr(strScheme: string): boolean;
            function parse(strScheme: string): DenoLand;
            function buildUrl(scheme: Url.DenoLand, params: {
                pathToFile?: string;
                branch?: string;
            }): string;
        }
        export function matchStr(strScheme: string): boolean;
        export function parse(strScheme: string): Scheme;
        export function buildUrl(scheme: Url, params: {
            pathToFile?: string;
            branch?: string;
        }): string;
        export {};
    }
    function parse(strScheme: string): Scheme;
    function buildUrl(scheme: Scheme, params: {
        pathToFile?: string;
        branch?: string;
    }): string;
    function resolveVersion(scheme: Scheme, params: {
        version: string;
    }): Promise<{
        couldConnect: true;
        scheme: Scheme;
        notTheExactVersionWarning: string | undefined;
    } | {
        couldConnect: false;
    }>;
}
