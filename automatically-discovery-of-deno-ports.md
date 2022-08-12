# 👩💼 Automatically discovery of Deno ports

If have published your module both on [deno.land/x](https://deno.land/x) and NPM Denoify should be able to automatically resolve your Deno distribution, what do I mean by that? &#x20;

### Examples of resolutions that denoify can perform automatically

Let's assume we are in a project  in our `node_modules` directory we have the following three Denoified modules:

* &#x20;[tsafe](https://www.npmjs.com/package/tsafe) in version `0.10.1`
* [my-dummy-npm-and-deno-module](https://www.npmjs.com/package/my-dummy-npm-and-deno-module) in version `0.4.3`
* [leac](https://www.npmjs.com/package/leac) in version `0.5.0`

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
import { assert } from "https://raw.githubusercontent.com/garronej/tsafe/v0.10.1/deno_dist/assert.ts";
import type { Equals } from "https://raw.githubusercontent.com/garronej/tsafe/v0.10.1/deno_dist/mod.ts";
import * as ns from "https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/v0.4.3/deno_dist/mod.ts";
import { Cat } from "https://raw.githubusercontent.com/garronej/my_dummy_npm_and_deno_module/v0.4.3/deno_dist/lib/Cat.ts";
import { createLexer } from "https://raw.githubusercontent.com/mxxii/leac/v0.5.0/deno/leac.ts";
```
