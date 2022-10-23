# 🔧 Build options

{% hint style="info" %}
The Denoify configurations used to be specified [in the `package.json`](https://github.com/garronej/my\_dummy\_npm\_and\_deno\_module/blob/346b2291366aa7ef76ec0bde113699d84e65ed9e/package.json#L19-L36) file. It's still supported for legacy reasons but you are now encoraged to use a configuration separate configuration file. &#x20;
{% endhint %}

{% hint style="danger" %}
We will probably switch to using .denoify.config.json and .denoify.config.js in the next few days. Sorry about the upcoming breaking change. We'll do the change quick. &#x20;
{% endhint %}

<figure><img src=".gitbook/assets/image (2).png" alt=""><figcaption><p>The configuration file as shown when using the vscode-icons extension (soon)</p></figcaption></figure>

Denoify be looking in the root of your project for a `.denoifyrc.json`, `.denoifyrc.yml` or `.denoifyrc.js` configuration file. Pick the format that is more conveignent for you. &#x20;

Following is the type definition of the object expected to be represented in the denoify configuration file: &#x20;

```typescript
export type DenoifyParams = {
    replacer?: string;
    ports?: {
        [portName: string]: string;
    };
    out?: string;
    index?: string;
    includes?: (
        | string
        | {
              src: string;
              destDir?: string;
              destBasename?: string;
          }
    )[];
};
```

_(It's defined_ [_here_](https://github.com/garronej/denoify/blob/main/src/lib/config/parseParams.ts) _in the code)_

### `out`

By default Denoify will generate the deno distribution in `deno_dist` or `deno_lib` depending on whay you have in your `tsconfig.json.`

If you want the for example your dist to be generated in a deno dir instead you would use: &#x20;

```json
//.denoifyrc.json
{
    "out": "./deno"
}
```

### `index`

Usually the index of your module is specified in the [main field of your package.json](https://github.com/garronej/evt/blob/e5d91ba991e0d2413d70ea0ae6e4d1fc838b2d1d/package.json#L9). If for some reason Denoify dosen't manage to locate this file you can tell explcitely what file should be made the `mod.ts` file: &#x20;

```json
//.denoifyrc.json
{
    "index": "./src/foo.ts"
}
```

### `includes`

Specify what files should be copied over to the deno\_dist directory. By default it's the `README.md` and the `LICENSE` file. &#x20;

More info [here](https://github.com/garronej/my\_dummy\_npm\_and\_deno\_module#step-5-chose-what-files-you-wish-to-include-in-the-deno\_dist-directory).

### `replacer`

It les you point to a custom function that will intercept how Denoify replace the imports statement of external module. &#x20;

It's usefull if you know the existence of a port for a specific library.  For example Denoify support React out of the box thanks to a [builtin replacer we have for it](https://github.com/garronej/denoify/blob/main/src/bin/replacer/react-dom.ts).  &#x20;

Using a replacer is very powerfull but very tricky as well, you should avoid it if you can. &#x20;

[Here](https://github.com/garronej/my\_dummy\_npm\_and\_deno\_module/blob/1415f364f877a166bd21a916d3f6005fd32e9413/README.md?plain=1#L147-L165) you have a concreate usage example ins the demo repo.

### `ports`

By default, if you don't specify any ports and, let's say, you have [js-yaml](https://www.npmjs.com/package/js-yaml) in your dependency pinned at the version `4.1.0` in your `package-lock.json` or `yarn.lock`. &#x20;

Denoify will replace:

```typescript
import { load } from "js-yaml";
```

with:

```typescript
import { load } from "npm:js-yaml@4.1.0";
```

This will work with version of Deno new enough to have NPM support but you probably want to avoir shipping with a dependency on NPM.   &#x20;

More info [here](https://github.com/garronej/my\_dummy\_npm\_and\_deno\_module/blob/1415f364f877a166bd21a916d3f6005fd32e9413/README.md?plain=1#L123-L145).

#### There is an existing port on deno.land/x

If you know that a port exists on deno.land/x you can specify it:&#x20;

```json
//.denoifyrc.json
{
    "ports": {
        "js-yaml": "https://deno.land/x/js_yaml_port/js-yaml.js"
    }
}
```

In this situation the previous import statement will be replaced with: &#x20;

```typescript
import { load } from "https://deno.land/x/js_yaml_port@3.14.0/js-yaml.js";
```

Denoify will do it's best to resolve to the version closest to the one that you have pinned. In this case it will fail to find `4.1.0` so it will take the latest that is [3.14.0](https://deno.land/x/js\_yaml\_port@3.14.0). &#x20;



Now what if there is no existing port? &#x20;

#### You Denoify the dependency yourself in a fork

Don't do that unless you have tried everything else. It's usually much easyer to just ust a .deno.ts file. &#x20;

With:&#x20;

```json
//.denoifyrc.json
{
    "ports": {
        "ts-md5": "garronej/ts-md5"
    }
}
```

The following import:&#x20;

```typescript
import { Md5 } from "ts-md5";
```

Will be transformed into: &#x20;

```typescript
import { Md5 } from "https://raw.githubusercontent.com/garronej/ts-md5/v1.2.7/deno_dist/mod.ts";
```

More details [here](https://github.com/garronej/my\_dummy\_npm\_and\_deno\_module/blob/1415f364f877a166bd21a916d3f6005fd32e9413/README.md?plain=1#L105-L121).
