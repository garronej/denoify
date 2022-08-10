# Quick start

## Complete guide

{% embed url="https://github.com/garronej/my_dummy_npm_and_deno_module" %}

The best way to start with Keycloakify is to clone the demo project and start playing with it.&#x20;

```bash
git clone https://github.com/garronej/my_dummy_npm_and_deno_module
cd my_dummy_npm_and_deno_module
npm install
npm run build

# Run the sample with node
node dist/test/test1.js

# Run the sample with Deno
deno run --allow-read --allow-env deno_dist/test/test1.ts
```

You can have a look at how the sources are transformed from [the src directory](https://github.com/garronej/my\_dummy\_npm\_and\_deno\_module/tree/master/src) into [the deno\_dist directory](https://github.com/garronej/my\_dummy\_npm\_and\_deno\_module/tree/master/deno\_dist). &#x20;

Then, for greater details, please refer to [the README of the demo project](https://github.com/garronej/my\_dummy\_npm\_and\_deno\_module/blob/master/README.md).  It explains the various capabilities of Denoify. &#x20;

## Other resources

{% embed url="https://habr.com/ru/company/vdsina/blog/527540/" %}

{% embed url="https://dev.to/nebrelbug/adding-deno-support-to-the-eta-template-engine-28n7" %}
