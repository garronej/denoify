import { DenoDependencies } from "./getDenoDependencyFactory";
export declare function run(params: {
    srcDirPath: string;
    destDirPath: string;
    nodeModuleDirPath: string;
    denoDependencies: DenoDependencies;
}): Promise<void>;
