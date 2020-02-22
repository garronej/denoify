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
/** Save results of anterior calls */
function addCache(f) {
    const previousResults = new Map();
    return (function callee(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = JSON.stringify(args);
            if (previousResults.has(key)) {
                return previousResults.get(key);
            }
            previousResults.set(key, yield f(...args));
            return callee(...args);
        });
    });
}
exports.addCache = addCache;
