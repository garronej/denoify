# 🪄 Special comments

### `// @denoify-ignore`

You can place a `// @denoify-ignore` comment at the top of your file. This will make Denoify completely ignore this file, just like if it wasn't in your source.  &#x20;

Example, [this file](https://github.com/garronej/my\_dummy\_npm\_and\_deno\_module/blob/master/src/bin/customReplacer.ts) is `denoify-ignored`, it's [not in the `deno_dist` directory](https://github.com/garronej/my\_dummy\_npm\_and\_deno\_module/tree/master/deno\_dist).

You have to use this if you have a [custom replacer](build-options.md#replacer). &#x20;

### `// @denoify-line-ignore`

Denoify will ignore every lines following a `// @denoify-line-ignore` special comment. &#x20;

It's especially usefull for ignoring import of polyfill. &#x20;

Example of [a file using this special comment](https://github.com/garronej/evt/blob/e5d91ba991e0d2413d70ea0ae6e4d1fc838b2d1d/src/lib/Evt.ts#L1-L6). And [the transpiled result](https://github.com/garronej/evt/blob/v2.4.7/deno\_dist/lib/Evt.ts).
