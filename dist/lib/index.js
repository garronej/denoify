"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const denoifySourceCodeStringFactory_1 = require("./denoifySourceCodeStringFactory");
const transformCodebase_1 = require("./transformCodebase");
const getDenoDependencyFactory_1 = require("./getDenoDependencyFactory");
function run(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { srcDirPath, destDirPath, nodeModuleDirPath, denoDependencies } = params;
        const { denoifySourceCodeString } = denoifySourceCodeStringFactory_1.denoifySourceCodeStringFactory(getDenoDependencyFactory_1.getDenoDependencyFactory({
            nodeModuleDirPath,
            denoDependencies
        }));
        yield transformCodebase_1.transformCodebase({
            srcDirPath,
            destDirPath,
            "transformSourceCodeString": ({ extension, sourceCode }) => /^\.ts$/i.test(extension) || /^\.js$/i.test(extension) ?
                denoifySourceCodeString({ sourceCode })
                :
                    Promise.resolve(sourceCode)
        });
    });
}
exports.run = run;
