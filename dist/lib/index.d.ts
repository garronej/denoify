import { RepoIndex } from "./getDenoModuleRepoFactory";
export declare function run(params: {
    srcDirPath: string;
    destDirPath: string;
    nodeModuleDirPath: string;
    repoIndex: RepoIndex;
}): Promise<void>;
