"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const denoifySourceCodeStringFactory_1 = require("./denoifySourceCodeStringFactory");
const transformCodebase_1 = require("./transformCodebase");
const getDenoDependencyFactory_1 = require("./getDenoDependencyFactory");
async function run(params) {
    const { srcDirPath, destDirPath, nodeModuleDirPath, denoDependencies } = params;
    const { denoifySourceCodeString } = denoifySourceCodeStringFactory_1.denoifySourceCodeStringFactory(getDenoDependencyFactory_1.getDenoDependencyFactory({
        nodeModuleDirPath,
        denoDependencies
    }));
    await transformCodebase_1.transformCodebase({
        srcDirPath,
        destDirPath,
        "transformSourceCodeString": ({ extension, sourceCode }) => /^\.?ts$/i.test(extension) || /^\.?js$/i.test(extension) ?
            denoifySourceCodeString({ sourceCode })
            :
                Promise.resolve(sourceCode)
    });
}
exports.run = run;
