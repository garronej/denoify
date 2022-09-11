# 🔍 Automatic discovery of ports

If have published your module both on [deno.land/x](https://deno.land/x) and NPM Denoify should be able to automatically resolve your Deno distribution, what do I mean by that? &#x20;

### Examples of resolutions that denoify can perform automatically

Let's assume we are in a project  in our `node_modules` directory we have the following three Denoified modules:

* &#x20;[tsafe](https://www.npmjs.com/package/tsafe) in version `0.10.1`
* [my-dummy-npm-and-deno-module](https://www.npmjs.com/package/my-dummy-npm-and-deno-module) in version `0.4.3`
* [leac](https://www.npmjs.com/package/leac) in version `0.6.0`

### Input

```typescript
// src/foo.ts
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import * as ns from "my-dummy-npm-and-deno-module";
import { Cat } from "my-dummy-npm-and-deno-module/dist/lib/Cat";
import { createLexer } from "leac";
```

### Output

Now if we run `npx denoify` it will generates this: &#x20;

```typescript
// deno_dist/foo.ts
import { assert } from "https://deno.land/x/tsafe@v0.10.1/assert.ts";
import type { Equals } from "https://deno.land/x/tsafe@v0.10.1/mod.ts";
import * as ns from "https://deno.land/x/my_dummy_npm_and_deno_module@v0.4.3/mod.ts";
import { Cat } from "https://deno.land/x/my_dummy_npm_and_deno_module@v0.4.3/lib/Cat.ts";
import { createLexer } from "https://deno.land/x/leac/v0.6.0/mod.ts";
```

If tsafe wasn't published on deno.land/x instead of `https://deno.land/x/tsafe@v0.10.1/assert.ts` we would have `https://raw.githubusercontent.com/garronej/tsafe/v0.10.1/deno_dist/assert.ts`. &#x20;

Denoify always find the files on GitHub first and then try to see if it can get the same file with a deno.land/x url on a best effort basis. &#x20;

If you want it to work your repo should have the same name as the deno module you have published ( we replace the `-` by `_` ).

### Troubleshooting

For some reason, automatic resolution dosen't work well with your module? &#x20;

Please reach out by opening a discussion!

{% embed url="https://github.com/garronej/denoify/discussions" %}

If you want to check for common problem before contacting the community here are some things you might want to check out:&#x20;

* If you are using [the `--out` CLI parameter](https://github.com/garronej/denoify/blob/07acce8a93bc2fae2f877a2068ec3bcca3a8bb05/src/bin/denoify.ts#L25) define [`denoify.out` in your `package.json`](https://github.com/mxxii/leac/blob/20bc039ee3446f7b13cf3f52737b538fece75094/package.json#L87) instead. &#x20;
* Makes sure you do not get [this message](https://github.com/garronej/denoify/blob/07acce8a93bc2fae2f877a2068ec3bcca3a8bb05/src/lib/denoify.ts#L228-L230) when you run `npx denoify`.  If you do make sur your  [`main` property of your `package.json`](https://github.com/mxxii/leac/blob/20bc039ee3446f7b13cf3f52737b538fece75094/package.json#L27) is correct.&#x20;
* Makes sure you have a repository field in your `package.json` that points to the correct repo. [Example](https://github.com/garronej/my\_dummy\_npm\_and\_deno\_module/blob/e92520a94d160f1f1174969b023fba57a78a744b/package.json#L4-L7)
* Make sure you [create a git Tag](https://user-images.githubusercontent.com/6702424/184397579-b95b7115-4934-433c-9cd3-7fff48818ddc.png) for [every NPM version you release](https://user-images.githubusercontent.com/6702424/184398120-9d837245-ec8c-498d-8805-a3e721a2d4c5.png). (A git tag is created when you create a GitHub Release)
* Make sure there is always a `tsconfig.json` file at the root of your repo, on every version tag, and that it specifies the option [`compilerOptions.outDir`](https://github.com/garronej/my\_dummy\_npm\_and\_deno\_module/blob/23b5cb6d0d88c8f64303c3c1231be941f79c1cd6/tsconfig.json#L12).
