# How denoify automatically discovers Deno ports

You want to makes sure Denoify is able to automatically discover the Deno distribution of your NPM modules?  Let's break out the algorithm that enables Denoify to automatically discover Deno ports of NPM modules. &#x20;

### What are we talking about

Let's say that in your source you have this statement: &#x20;

```typescript
// src/foo.ts
import { assert } from "tsafe/assert";
```

And you have [tsafe](https://github.com/garronej/tsafe) in version `v0.10.1` installed in `node_modules/tsafe`

Now if you run npx denoify it will generates this: &#x20;

```typescript
// deno_dist/foo.ts
import { assert } from "https://raw.githubusercontent.com/garronej/tsafe/v0.10.1/deno_dist/assert.ts"
```

### The algorithme

* It reads [the `repository` field of your `package.json`](https://github.com/garronej/tsafe/blob/336c288bca8dea5c3448695dd2c93c50b93871fa/package.json#L5-L8) if it dosen't points to a GitHub repo, it aborts.
* Denoify will look for for something looking like a Deno distribution...
  * ... if there is a git tag v0.10.1 it will look here in priority, else...
  * ... it will look in a git tag 0.10.1 (without the v prefix), else...
  * ... it will look in the latest git tag and on the default branch but if it finds something there it will print a warning because it didn't find the exact version it was looking for.

#### What qualifies as a Deno port

* There is `mod.ts` file at the root, else
* (TODO) It reads the `denoify.out` and `denoify.index` field from the `package.json`, else.
* It reads the `compilerOption.outDir` or `compilerOption.declarationDir (TODO)` field from the `tsconfig.json` and look for a `deno_xxx` directory (usually `deno_dist`)
