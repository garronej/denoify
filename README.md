# 🚀 Quick start

The best way to get started with Denoify is to start hacking around with the demo repo, you can come back later on to this doc for more details about the available options.

{% embed url="https://github.com/garronej/my_dummy_npm_and_deno_module" %}

```bash
git clone https://github.com/garronej/my_dummy_npm_and_deno_module
cd my_dummy_npm_and_deno_module
yarn install
yarn build

# Run the sample with node
node dist/test/test1.js

# Run the sample with Deno
deno run --allow-read --allow-env deno_dist/test/test1.ts
```

You can have a look at how the sources are transformed from [the src directory](https://github.com/garronej/my\_dummy\_npm\_and\_deno\_module/tree/master/src) into [the deno\_dist directory](https://github.com/garronej/my\_dummy\_npm\_and\_deno\_module/tree/master/deno\_dist). &#x20;
