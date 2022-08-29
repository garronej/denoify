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
</p>

> IMPORTANT: [Deno will soon support NPM modules](https://deno.com/blog/changes#compatibility-with-node-and-npm).  
> For NPM module authors this means that you'll just need to tell your users to import your module like:  
> `import express from "npm:express@5";`.  
> Knowing that why would you want to use Denoify?
>
> -   To publish your module on [deno.land/x](https://deno.land/x) there by signaling that you care about Deno.
> -   If your module belong in the 10% of NPM modules that doesn't work out of the box. Denoify can help you
>     providing Deno implementation for specific file of your module (xxx.deno.ts).
> -   It enables to produce a very predictable distribution of your module for Deno with the node builtins ports pinned to
>     a specific version. If you don't use Denoify and users import your module like `import abc from "npm:your-module@1.2.3`
>     Deno will pull the last version of https://deno.land/std/node. An update there could end up breaking your module
>     on Deno.

<br>

# What it is

A build tool that takes as input a TypeScript codebase that was meant to target node and/or the web and spits out a modified version of the source files ready to be deployed as a Deno module.

![what_denoify_does](https://user-images.githubusercontent.com/6702424/85449626-41b10c80-b598-11ea-91cc-6805facab1dd.png)

> **NOTE:** Denoify won't run on Deno, it is a Node module.

> **NOTE:** Denoify is capable of **recursively** resolving **dependencies**!  
> It works out of the box with dependencies that uses denoify
> and there are many option for dealing with dependencies that won't transpile automatically. [See specific documentation](https://github.com/garronej/my_dummy_npm_and_deno_module)

This tool is mainly for NPM module maintainer, to enable them to bring first-class citizen Deno support to their modules and do so without introducing breaking changes.

# Motivations

-   Although it is quite easy to port a module to Deno no one wants to maintain two codebase.
-   Wouldn't it be great to have a tool able to bring Deno support to NPM modules?

# Example of modules using Denoify

Some modules that have been made cross-runtime using Denoify:

-   [graphql-helix](https://github.com/contrawork/graphql-helix)
-   [EVT](https://evt.land)
-   [Nano JSX](https://github.com/nanojsx/nano)
-   [eta](https://deno.land/x/eta@v1.3.0)
-   [hono](https://github.com/honojs/hono)
-   [tsafe](https://github.com/garronej/tsafe)
-   [@sniptt/guards](https://github.com/sniptt-official/guards)
-   [ok-computer](https://github.com/richardscarrott/ok-computer)
-   [run-exclusive](https://github.com/garronej/run-exclusive)
-   [Yolk](https://github.com/nestdotland/yolk)
-   [...and many more great modules](https://github.com/garronej/denoify/network/dependents?package_id=UGFja2FnZS0yNzE2MjkwMjI%3D)

# Limitations

Coming up next is a detailed guide on how to set up denoify with your project and how
to publish on [deno.land/x](https://deno.land/x) but before anything
here are the current limitations you need to be aware of.

-   If your module is vanilla JS it needs to be ported to TypeScript first. (1)
-   `require()` is not supported.
-   You can't `fs.readFile()` files that are part of the module ( files inside a `res/`
    directory for example ). (2)

(1) _Don't be afraid, renaming your source with `.ts` and dropping some `any` here
and there will do the trick.
You will be able to pull it off even if you aren't familiar with typescript. [Ref](https://github.com/garronej/my_dummy_npm_and_deno_module#enable-strict-mode-and-fixes-errors-if-any)_

(2) _In Deno the files that forms your module won’t be pre-fetched and
placed in `node_module` like in node so you won’t be able to access files that are not
on the disk._

# Step by step tutorial

Check out [this repo](https://github.com/garronej/my_dummy_npm_and_deno_module) to see in practice how to set up Denoify in your project.

Need a hand? Do not hesitate to [open a discussion](https://github.com/garronej/denoify/discussions).

# Publishing on deno.land/x

> 🗣 NOTE TO THE COMMUNITY: I am please to see an increasing number of project using Denoify! 🎉  
> That said, looking at your setup, I see that you are almost all tracking the `deno_dist` directory
> on your default branch...  
> `deno_dist` should be git ignored, it's not source code!  
> Please, do not hesitate [to reach out](https://github.com/garronej/denoify/discussions) if you need a hand.

![denoify_ci](https://user-images.githubusercontent.com/6702424/82036935-c52a3480-96a1-11ea-9794-e982a23e5612.png)

Once you'll have successfully build your module for Deno you will want to publish it on [deno.land/x](https://deno.land/x)
to do that in a clean way, without tracking the `deno_dist/` on your main branch you'll need to setup a
CI workflow.  
To do that you can use the [`.github/workflow/ci.yaml`](https://github.com/garronej/tsafe/blob/main/.github/workflows/ci.yaml) from [tsafe](https://github.com/garronej/tsafe), you can copy paste it, it's portable.  
The idea is that it creates [a `latest` branch](https://github.com/garronej/tsafe/tree/latest) on every release (when you bump the package.json version) where the `deno_dist` is present.

![image](https://user-images.githubusercontent.com/6702424/117559526-6ade6c80-b086-11eb-8575-3084f0835bbb.png)

When registering your module on [deno.land/x](https://deno.land/x) you will need to specify the subdirectory:

![deno_registration](https://user-images.githubusercontent.com/6702424/117559462-c9571b00-b085-11eb-9ea5-683a0b0bb866.png)

Do not hesitate [to open a discursion](https://github.com/garronej/denoify/discussions) if you are having issues.

# Deal with `GitHub API rate limit exceeded`

If you run Denoify a lot outside of GitHub Actions pipelines you will eventually get the following error:  
`RequestError [HttpError]: API rate limit exceeded for 176.170.197.165. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)`.
To fix it, [create a GitHub Personal Access Token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) and provide it as the environnement variable `GITHUB_TOKEN` when you run the build tool.

Example:

```bash
echo 'export GITHUB_TOKEN=ghp_xn8jsxZrUChs9nmfZPDSmxLrTJPVJy3Sxc5J' > ~/.bash_profile
source ~/.bash_profile
npx denoify
```

# What's new

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
