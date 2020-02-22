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
/** Equivalent of String.prototype.replace but with async replacer is async */
function replaceAsync(str, regex, replacerAsync) {
    return __awaiter(this, void 0, void 0, function* () {
        const promises = [];
        str.replace(regex, (match, ...args) => {
            const promise = replacerAsync(match, ...args);
            promises.push(promise);
            return "";
        });
        const data = yield Promise.all(promises);
        return str.replace(regex, () => data.shift());
    });
}
exports.replaceAsync = replaceAsync;
