"use strict";
exports.__esModule = true;
require("../lib");
var parallel_hasher_1 = require("ts-md5/dist/parallel_hasher");
var hasher = new parallel_hasher_1.ParallelHasher('/path/to/ts-md5/dist/md5_worker.js');
hasher.hash("fooBarBaz").then(function (result) {
    console.log('md5 of fileBlob is', result);
});
