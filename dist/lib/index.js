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
const replaceImportsFactory_1 = require("./replaceImportsFactory");
const transformCodebase_1 = require("./transformCodebase");
const getDenoModuleRepoFactory_1 = require("./getDenoModuleRepoFactory");
function run(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { srcDirPath, destDirPath, nodeModuleDirPath, repoIndex } = params;
        const { replaceImports } = replaceImportsFactory_1.replaceImportsFactory(getDenoModuleRepoFactory_1.getDenoModuleRepoFactory({
            nodeModuleDirPath,
            repoIndex
        }));
        yield transformCodebase_1.transformCodebase({
            srcDirPath,
            destDirPath,
            "transformSourceCode": ({ extension, sourceCode }) => /^\.ts$/i.test(extension) || /^\.js$/i.test(extension) ?
                replaceImports({ sourceCode })
                :
                    Promise.resolve(sourceCode)
        });
    });
}
exports.run = run;
