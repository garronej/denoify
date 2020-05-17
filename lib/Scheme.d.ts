export declare type Scheme = Scheme.GitHub | Scheme.Url;
export declare namespace Scheme {
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
        };
        export type GitHub = Common & {
            urlType: "github";
            branch: string;
        };
        export namespace GitHub {
            function matchStr(strScheme: string): boolean;
            function parse(strScheme: string): GitHub;
        }
        export type DenoLand = Common & {
            urlType: "deno.land";
            branch?: string;
        };
        export namespace DenoLand {
            function matchStr(strScheme: string): boolean;
            function parse(strScheme: string): DenoLand;
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
        scheme: Scheme;
        warning: string | undefined;
    }>;
}
