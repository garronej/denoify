export const knownPorts = {
    "builtins": {
        "events": "https://deno.land/std/node/events.ts",
        "fs": "https://deno.land/std/node/fs.ts",
        "os": "https://deno.land/std/node/os.ts", //Partial
        "path": "https://deno.land/std/node/path.ts",
        "process": "https://deno.land/std/node/process.ts", //Partial
        "querystring": "https://deno.land/std/node/querystring.ts",
        "timers": "https://deno.land/std/node/timers.ts",
        "util": "https://deno.land/std/node/util.ts", //Partial
        "global": "https://deno.land/std/node/global.ts",
        "buffer": "https://deno.land/std/node/buffer.ts", //Partial
        "url": "https://deno.land/std/node/url.ts",
        "assert": "https://deno.land/std/node/assert.ts",
        "crypto": "https://deno.land/std/node/crypto.ts", //Very partial
        "stream": "https://deno.land/std/node/stream.ts",
        "child_process": "https://deno.land/std/node/child_process.ts",
        "console": "https://deno.land/std/node/console.ts",
        "cluster": "https://deno.land/std/node/cluster.ts",
        "dgram": "https://deno.land/std/node/dgram.ts",
        "dns": "https://deno.land/std/node/dns.ts",
        "http": "https://deno.land/std/node/http.ts",
        "http2": "https://deno.land/std/node/http2.ts",
        "https": "https://deno.land/std/node/https.ts",
        "inspector": "https://deno.land/std/node/inspector.ts",
        "module": "https://deno.land/std/node/module.ts",
        "net": "https://deno.land/std/node/net.ts",
        "perf_hooks": "https://deno.land/std/node/perf_hooks.ts",
        "readline": "https://deno.land/std/node/readline.ts",
        "repl": "https://deno.land/std/node/repl.ts",
        "string_decoder": "https://deno.land/std/node/string_decoder.ts",
        "sys": "https://deno.land/std/node/sys.ts",
        "tls": "https://deno.land/std/node/tls.ts",
        "tty": "https://deno.land/std/node/tty.ts",
        "v8": "https://deno.land/std/node/v8.ts",
        "vm": "https://deno.land/std/node/vm.ts",
        "wasi": "https://deno.land/std/node/wasi.ts",
        "worker_threads": "https://deno.land/std/node/worker_threads.ts",
        "zlib": "https://deno.land/std/node/zlib.ts"
        /*
        Important: built in missing: http, https...
        Follow evolution of support here: https://deno.land/std/node/README.md
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
