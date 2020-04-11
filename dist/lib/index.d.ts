import { DenoDependencies } from "./getDenoDependencyFactory";
export declare function run(params: {
    srcDirPath: string;
    destDirPath: string;
    projectPath: string;
    denoDependencies: DenoDependencies;
    devDependencies: string[];
}): Promise<void>;
