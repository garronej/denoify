
import { denoifySourceCodeStringFactory } from "./denoifySourceCodeStringFactory";
import { transformCodebase } from "./transformCodebase";
import { getDenoDependencyFactory, DenoDependencies } from "./getDenoDependencyFactory";

export async function run(
    params: {
        srcDirPath: string;
        destDirPath: string;
        nodeModuleDirPath: string;
        denoDependencies: DenoDependencies;
        devDependencies: string[];
    }
) {

    const {
        srcDirPath,
        destDirPath,
        nodeModuleDirPath,
        denoDependencies,
        devDependencies
    } = params;

    const { denoifySourceCodeString } = denoifySourceCodeStringFactory(
        getDenoDependencyFactory({
            nodeModuleDirPath,
            denoDependencies,
            devDependencies
        })
    );

    await transformCodebase({
        srcDirPath,
        destDirPath,
        "transformSourceCodeString": ({ extension, sourceCode }) =>
            /^\.?ts$/i.test(extension) || /^\.?js$/i.test(extension) ?
                denoifySourceCodeString({ sourceCode })
                :
                Promise.resolve(sourceCode)
    });

}

