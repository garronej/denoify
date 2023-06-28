<p align="center">
    <img src="https://user-images.githubusercontent.com/6702424/79351107-900eb300-7f38-11ea-8272-91ff725d29f3.png">
</p>
<p align="center">
    <i>🦕 Release on NPM and on deno.land/x with a single codebase🦕</i>
    <br>
    <br>
    <a href="https://github.com/garronej/denoify/actions">
      <img src="https://github.com/garronej/denoify/workflows/ci/badge.svg">
    </a>
    <a href="https://github.com/garronej/denoify/blob/main/LICENSE">
      <img src="https://img.shields.io/npm/l/denoify">
    </a>
</p>

</p>
<p align="center">
  <a href="https://www.denoify.land">Home</a>
  -
  <a href="https://docs.denoify.land">Documentation</a>
  -
  <a href="https://github.com/garronej/my_dummy_npm_and_deno_module">Demo repo</a>
</p>

# What it is

A build tool that takes as input a TypeScript codebase that was meant to target node and/or the web and spits out a modified version of the source files ready to be deployed as a Deno module.

![what_denoify_does](https://user-images.githubusercontent.com/6702424/85449626-41b10c80-b598-11ea-91cc-6805facab1dd.png)

> **NOTE:** Denoify is capable of **recursively** resolving **dependencies**!  
> It works out of the box with dependencies that uses denoify
> and there are many option for dealing with dependencies that won't transpile automatically. [See specific documentation](https://github.com/garronej/my_dummy_npm_and_deno_module)

This tool is mainly for NPM module publisher, to enable them to bring first-class citizen Deno support to their modules and do so without introducing breaking changes.

## Deno's Support for NPM Modules: What It Means and the Continued Relevance of Denoify

[Deno now supports NPM modules](https://deno.com/blog/changes#compatibility-with-node-and-npm).  
This development significantly benefits NPM module authors as it simplifies the process of integrating their modules into Deno.  
You simply instruct your users to import your module using the format: `import {...} from "npm:your-module@5";`.

However, even with this development, there are still compelling reasons to consider using Denoify for your module:

1. **Publishing on [deno.land/x](https://deno.land/x):** If you aspire to have your module incorporated into other Deno modules, it is crucial to release a Deno-specific distribution. Without it, your chances of significant inclusion are considerably diminished.

2. **Ensuring Retro Compatibility:** Denoify ensures your module remains compatible with earlier Deno versions lacking NPM support. This retro-compatibility broadens your module's user base and applicability.

3. **Tailoring Module Adaptations:** Not all NPM modules (approximately 10%) will work seamlessly with Deno out of the box. In these cases, Denoify can aid in creating Deno-specific implementations for particular files within your module ([`xxx.deno.ts`](https://docs.denoify.land/.deno.ts-files)).

Therefore, despite Deno's new NPM support, Denoify continues to offer value in ensuring wider compatibility, adaptability, and visibility for your module.

# Example of modules using Denoify

Some modules that have been made cross-runtime using Denoify:

-   [hono](https://github.com/honojs/hono)
-   [EVT](https://evt.land)
-   [Nano JSX](https://github.com/nanojsx/nano)
-   [eta](https://deno.land/x/eta@v1.3.0)
-   [graphql-helix](https://github.com/contrawork/graphql-helix)
-   [tsafe](https://github.com/garronej/tsafe)
-   [Automerge](https://github.com/automerge/automerge)
-   [...and many others](https://github.com/garronej/denoify/network/dependents?dependent_type=PACKAGE)

# Limitations

-   If your module is vanilla JS it needs to be ported to TypeScript first[^0].
-   `require()` is not supported.
-   You can't `fs.readFile()` files that are part of the module ( files inside a `res/`
    directory for example ). [^1]

[^0]:
    _Don't be afraid, renaming your source with `.ts` and dropping some `any` here
    and there will do the trick.
    You will be able to pull it off even if you aren't familiar with typescript. [Ref](https://github.com/garronej/my_dummy_npm_and_deno_module#enable-strict-mode-and-fixes-errors-if-any)_

[^1]:
    _In Deno the files that forms your module won’t be pre-fetched and
    placed in `node_module` like in node so you won’t be able to access files that are not
    on the disk._

# Get started

[🚀 **Quick start** 🚀](https://docs.denoify.land/)

# Doing without Denoify

If your project doesn't have any dependencies and isn't utilizing Node built-ins (e.g., fs, https, process), you have an alternative to Denoify. You can make use of the TypeScript compiler options `moduleResolution: bundler` and `allowImportingTsExtensions: true`. For more information, see [this comment](https://github.com/gvergnaud/ts-pattern/pull/108#issuecomment-1356829719).

Please note that this technique requires the addition of `.ts` extension to your source file imports. This could lead to potential compatibility issues with certain tools, and require an adjustment period.

# What's new

**NEW IN v1.6.0**

-   Support for Deno environnement variable (`Deno.env('XYZ')`). Thank you to @dancrumb for this feature. [See issue](https://github.com/garronej/denoify/issues/105)

**NEW IN v1.3.1**

-   Denoify now has [a proper documentation website](https://docs.denoify.land)!

**NEW IN v1.3**

-   Support for `// @denoify-line-ignore` special comment.

**NEW IN v1**

-   `import express from "express";` automatically converted into:  
    `import express from "npm:express@5";`  
    (See [this update](https://deno.com/blog/changes#compatibility-with-node-and-npm))  
    Most project will now transpile successfully out of the box.

**NEW IN v0.10**

-   Mitigate the risk of comment being accidentally modified.
-   Possibility to specify output directory in the package.json's denoify field. [See doc](https://github.com/garronej/my_dummy_npm_and_deno_module#optional-step-45-specify-the-output-directory).
-   Support module augmentation: `declare module ...`. [Example](https://github.com/gcanti/fp-ts/blob/60250b9de118d4939374368ca1be665bac871769/src/Endomorphism.ts#L40)
-   Possibility to explicitly tell where the `index.ts` is located in the source. [Doc](https://github.com/garronej/my_dummy_npm_and_deno_module#optional-step-475-specify-where-the-indexts-is-located-in-your-source)

**NEW IN v0.9**

-   `tsconfig.json` can be absent if outputDir is specified. [See @zxch3n's PR](https://github.com/garronej/denoify/pull/32)
-   Enable to configure the name of the output dir. It no longer has to be `deno_dist`. [See @zxch3n's PR](https://github.com/garronej/denoify/pull/31)

**NEW IN v0.7**

-   Support for esm modules. See [issue](https://github.com/garronej/denoify/issues/29). Thanks to [yandeu](https://github.com/yandeu).

**NEW IN v0.7**

-   Support for workspaces where `node_modules` are located in a parent directory.  
    Thx [@hayes](https://github.com/hayes) [See issue](https://github.com/garronej/denoify/issues/23)
-   Add basic support for child_process.spawn ([#785](https://github.com/denoland/deno_std/pull/785))

**NEW IN v0.6**

-   Built in support for [graphQL](https://www.npmjs.com/package/graphql).  
    See how [graphql-helix](https://github.com/contrawork/graphql-helix) got graphql working before `v0.6` using a [custom replacer](https://github.com/contrawork/graphql-helix/blob/79e863288a93d1b491caeca32a4124f97465d5a6/scripts/denoify-replacer.js)
    referenced in the [`package.json`](https://github.com/contrawork/graphql-helix/blob/79e863288a93d1b491caeca32a4124f97465d5a6/package.json).  
    You can do the same with other modules using [skypack.dev](https://www.skypack.dev/) or [jspm](https://jspm.org/)
-   It is now possible to use `console.log()` in custom replacers to help debug.
-   [Some support](https://github.com/denoland/deno/pull/8191) for `crypto` node builtin.

**NEW IN v0.5** _Breaking changes_

-   All Denoify parameters are now gathered under a uniq `"denoify"` field.
-   Possibility to specify which files should be copied to the `deno_dist` directory (Previously only `README.md` was copied).  
    [Valid config example](https://github.com/garronej/my_dummy_npm_and_deno_module/blob/master/package.json)

# Introduction video

**NOTE: New features have been introduced since this meeting was hold**

[![Watch the video](https://user-images.githubusercontent.com/6702424/85890466-af09ab00-b7ed-11ea-9cf4-10c9bbfb3621.png)](https://youtu.be/vJQdfTPeeXw)
