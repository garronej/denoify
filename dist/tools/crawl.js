"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
/** List all files in a given directory return paths relative to the dir_path */
exports.crawl = (function () {
    var crawlRec = function (dir_path, paths) {
        for (var _i = 0, _a = fs.readdirSync(dir_path); _i < _a.length; _i++) {
            var file_name = _a[_i];
            var file_path = path.join(dir_path, file_name);
            var ls_stat = fs.lstatSync(file_path);
            if (ls_stat.isDirectory()) {
                crawlRec(file_path, paths);
                continue;
            }
            paths.push(file_path);
        }
    };
    return function crawl(dir_path) {
        var paths = [];
        crawlRec(dir_path, paths);
        return paths.map(function (file_path) { return path.relative(dir_path, file_path); });
    };
})();
