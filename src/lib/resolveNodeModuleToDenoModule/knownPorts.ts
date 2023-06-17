import { Dependencies } from "./resolveNodeModuleToDenoModule";

export const knownPorts: { builtins: Dependencies; third_party: Dependencies } = {
    "builtins": {
        "events": "node:events",
        "fs": "node:fs",
        "os": "node:os", //Partial
        "path": "node:path",
        "process": "node:process",
        "querystring": "node:querystring",
        "timers": "node:timers",
        "util": "node:util", //Partial
        "global": "node:global",
        "buffer": "node:buffer", //Partial
        "url": "node:url",
        "assert": "node:assert",
        "crypto": "node:crypto", //Very partial
        "stream": "node:stream",
        "child_process": "node:child_process",
        "console": "node:console",
        "cluster": "node:cluster",
        "dgram": "node:dgram",
        "dns": "node:dns",
        "http": "node:http",
        "http2": "node:http2",
        "https": "node:https",
        "inspector": "node:inspector",
        "module": "node:module",
        "net": "node:net",
        "perf_hooks": "node:perf_hooks",
        "readline": "node:readline",
        "repl": "node:repl",
        "string_decoder": "node:string_decoder",
        "sys": "node:sys",
        "tls": "node:tls",
        "tty": "node:tty",
        "v8": "node:v8",
        "vm": "node:vm",
        "wasi": "node:wasi",
        "worker_threads": "node:worker_threads",
        "zlib": "node:zlib"
        /*
        Important: built in missing: http, https...
        Follow evolution of support here: node:README
        __filename and __dirname supported.
        */
    },
    "third_party": {
        "js-yaml": "https://deno.land/x/js_yaml_port/js-yaml.js",
        "ts-md5": "garronej/ts-md5", //It is a denoified module, we just need to point to the repo.

        /*
        Unfortunately, you still have to use //@ts-ignore when using Reflect.getMetadata('design:paramtypes', target, key); 
        or other reflect-metadata feature. There is currently no way of loading the types definitions in Deno.

        See: https://github.com/ovesco/diosaur/pull/4
        */
        "reflect-metadata": "https://raw.githubusercontent.com/rbuckton/reflect-metadata/master/Reflect.js",
        "fp-ts": "garronej/fp-ts"

        /*
        NOTE: react, react-dom, rxjs and other modules are supported via custom import replacer.
        Checkout the complete list here: https://github.com/garronej/denoify/tree/master/src/bin/replacer
        More module coming soon.
        */
    }
};
