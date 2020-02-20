

import "my-fake-module-1";
import { Foo } from "my-fake-module-2";
import * as nsBar from "my-fake-module-3";

import("my-fake-module-4").then(()=>{});

import "./foo/bar";
import { Foo } from "../bar/baz";
import * as nsBar from "./package.json";

import("my-fake-module-4/disl/lib/Observable").then(()=>{});