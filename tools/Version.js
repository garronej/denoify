"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Version = void 0;
var Version;
(function (Version) {
    function parse(versionStr) {
        const match = versionStr.match(/^([0-9]+)\.([0-9]+)\.([0-9]+)$/);
        if (!match) {
            throw new Error(`${versionStr} is not a valid NPM version`);
        }
        return {
            "major": parseInt(match[1]),
            "minor": parseInt(match[2]),
            "patch": parseInt(match[3])
        };
    }
    Version.parse = parse;
    ;
    function stringify(v) {
        return `${v.major}.${v.minor}.${v.patch}`;
    }
    Version.stringify = stringify;
    /**
     *
     * v1  <  v2  => -1
     * v1 === v2  => 0
     * v1  >  v2  => 1
     *
     */
    function compare(v1, v2) {
        const sign = (n) => n === 0 ? 0 : (n < 0 ? -1 : 1);
        if (v1.major === v2.major) {
            if (v1.minor === v2.minor) {
                return sign(v1.patch - v2.patch);
            }
            else {
                return sign(v1.minor - v2.minor);
            }
        }
        else {
            return sign(v1.major - v2.major);
        }
    }
    Version.compare = compare;
    function bumpType(params) {
        const versionAhead = parse(params.versionAheadStr);
        const versionBehind = parse(params.versionBehindStr);
        if (compare(versionBehind, versionAhead) === 1) {
            throw new Error(`Version regression ${versionBehind} -> ${versionAhead}`);
        }
        if (versionBehind.major !== versionAhead.major) {
            return "MAJOR";
        }
        else if (versionBehind.minor !== versionAhead.minor) {
            return "MINOR";
        }
        else if (versionBehind.patch !== versionAhead.patch) {
            return "PATCH";
        }
        else {
            return "SAME";
        }
    }
    Version.bumpType = bumpType;
})(Version = exports.Version || (exports.Version = {}));
//# sourceMappingURL=Version.js.map