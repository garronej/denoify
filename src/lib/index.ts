
import { denoifySourceCodeStringFactory } from "./denoifySourceCodeStringFactory";
import { transformCodebase } from "./transformCodebase";
import { getDenoDependencyFactory, DenoDependencies } from "./getDenoDependencyFactory";

export async function run(
    params: {
        srcDirPath: string;
        destDirPath: string;
        projectPath: string;
        denoDependencies: DenoDependencies;
        devDependencies: string[];
    }
) {

    const {
        srcDirPath,
        destDirPath,
        projectPath,
        denoDependencies,
        devDependencies
    } = params;

    const { denoifySourceCodeString } = denoifySourceCodeStringFactory(
        getDenoDependencyFactory({
            projectPath,
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

