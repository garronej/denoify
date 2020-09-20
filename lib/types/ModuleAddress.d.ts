export declare type ModuleAddress = ModuleAddress.GitHubRepo | ModuleAddress.GitHubRawUrl | ModuleAddress.DenoLandUrl;
export declare namespace ModuleAddress {
    /** e.g: "github:userOrOrg/repositoryName#branch" */
    type GitHubRepo = {
        type: "GITHUB REPO";
        userOrOrg: string;
        repositoryName: string;
        branch?: string;
    };
    namespace GitHubRepo {
        /**
         * Input example
         * KSXGitHub/simple-js-yaml-port-for-deno or
         * github:KSXGitHub/simple-js-yaml-port-for-deno or
         * KSXGitHub/simple-js-yaml-port-for-deno#3.12.1 or
         * github:KSXGitHub/simple-js-yaml-port-for-deno#3.12.1 or
         */
        function parse(raw: string): GitHubRepo;
        /** Match valid parse input */
        function match(raw: string): boolean;
    }
    /** https://raw.githubusercontent.com/user/repo/branch/path/to/file.ts */
    type GitHubRawUrl = {
        type: "GITHUB-RAW URL";
        baseUrlWithoutBranch: string;
        pathToIndex: string;
        branch: string;
    };
    namespace GitHubRawUrl {
        function parse(raw: string): GitHubRawUrl;
        function match(raw: string): boolean;
    }
    /** e.g: https://deno.land/x/foo@1.2.3/mod.js */
    type DenoLandUrl = {
        type: "DENO.LAND URL";
        isStd: boolean;
        baseUrlWithoutBranch: string;
        pathToIndex: string;
        branch?: string;
    };
    namespace DenoLandUrl {
        function parse(raw: string): DenoLandUrl;
        function match(raw: string): boolean;
    }
    function parse(raw: string): ModuleAddress;
}
