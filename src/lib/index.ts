
import { replaceImportsFactory } from "./replaceImportsFactory";
import { transformCodebase } from "./transformCodebase";
import { getDenoModuleRepoFactory, RepoIndex } from "./getDenoModuleRepoFactory";

export async function run(
    params: {
        srcDirPath: string;
        destDirPath: string;
        nodeModuleDirPath: string;
        repoIndex: RepoIndex;
    }
) {

    const { srcDirPath, destDirPath, nodeModuleDirPath, repoIndex } = params;

    const { replaceImports } = replaceImportsFactory(
        getDenoModuleRepoFactory({
            nodeModuleDirPath,
            repoIndex
        })
    );

    await transformCodebase({
        srcDirPath,
        destDirPath,
        "transformSourceCode": ({ extension, sourceCode }) =>
            /^\.ts$/i.test(extension) || /^\.js$/i.test(extension) ?
                replaceImports({ sourceCode })
                :
                Promise.resolve(sourceCode)
    });

}

