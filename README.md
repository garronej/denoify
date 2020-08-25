
<p align="center">
    <img src="https://user-images.githubusercontent.com/6702424/79351107-900eb300-7f38-11ea-8272-91ff725d29f3.png">
</p>
<p align="center">
    <i>🦕 Support Deno and release on NPM with a single codebase.🦕</i>
    <br>
    <br>
    <img src="https://github.com/garronej/denoify/workflows/ci/badge.svg">
</p>
<br>

# What it is

A build tool that takes as input a TypeScript codebase that was meant to target node and/or the web and spits out a modified version of the source files ready to be deployed as a Deno module.  

![what_denoify_does](https://user-images.githubusercontent.com/6702424/85449626-41b10c80-b598-11ea-91cc-6805facab1dd.png)

**NOTE:** Denoify won't run on Deno, it is a Node module.

If you are just looking for a quick way to load NPM modules in your Deno project
you can check out [CommonJS module Loading](https://github.com/denoland/deno/tree/master/std/node/#commonjs-module-loading),
unlike Denoify, it won't give you types definitions, it will involve `node_modules/`
and require `--allow-read` but it will also be easier to get working.
Some NPM modules can also be imported into Deno using CDN like [Skypack](https://www.skypack.dev) (ex [Pika](https://www.pika.dev/cdn)) or [jspm](https://jspm.org)
checkout [Soremwar/deno_types](https://github.com/Soremwar/deno_types) for some examples.  

This tool is mainly for NPM module maintainer, to enable them to bring first-class citizen Deno support to their modules and doing so without introducing breaking changes.

# Motivations

- Although it is quite easy to port a module to Deno no one wants to maintain two codebase.
- Wouldn't it be great to have a tool able to bring Deno support to NPM modules?

# Example of modules using Denoify

Modules that have been made cross-runtime using Denoify:

- [EVT](https://evt.land)
- [run-exclusive](https://github.com/garronej/run-exclusive)
- [Nano JSX](https://github.com/nanojsx/nano)

# Introduction video

**NOTE: New features have been introduced since this meeting was hold**

[![Watch the video](https://user-images.githubusercontent.com/6702424/85890466-af09ab00-b7ed-11ea-9cf4-10c9bbfb3621.png)](https://youtu.be/vJQdfTPeeXw)


# Limitations

Coming up next is a detailed guide on how to set up denoify with your project and how
to publish on [deno.land/x](https://deno.land/x) but before anything
here are the current limitations you need to be aware of.

- If your module is vanilla JS it needs to be ported to TypeScript first. (1)
- Not all Node's builtin are supported yet. (2) But thanks to the new mechanism, 
  [à la React Native](https://reactnative.dev/docs/platform-specific-code#platform-specific-extensions), 
  that let you have specific deno implementation for some of your files, the
  lack of support for `"https"` or `"net"`, while being annoying, is no longer a dead end.
- If your module has dependencies you will have to enable those dependencies to run on Deno.
  While well documented, be aware that it is a time consuming process.
- `require()` is not yet supported.
- You can't (yet) `fs.readFile()` files that are part of the module ( files inside a ``res/`` 
  directory for example ). (4)

(1) *Don't be afraid, renaming your source with ``.ts`` and dropping some ``any`` here 
and there will do the trick.
You will be able to pull it off even if you aren't familiar with typescript. [Ref](https://github.com/garronej/my_dummy_npm_and_deno_module#enable-strict-mode-and-fixes-errors-if-any)*

(2) *You can consult [here](https://deno.land/std/node#supported-builtins) the current state of the Node's builtin support.*

(4) *In Deno the files that forms your module won’t be pre-fetched and 
placed in ``node_module`` like in node so you won’t be able to access files that are not 
on the disk.*

# GUIDES

## Setting up an existing project

Check out [this repo](https://github.com/garronej/my_dummy_npm_and_deno_module) to see in practice how to set up Denoify in your project.

## Starting a project from scratch

![denoify_ci](https://user-images.githubusercontent.com/6702424/82036935-c52a3480-96a1-11ea-9794-e982a23e5612.png)

[denoify_ci](https://github.com/garronej/denoify_ci) is a template repo that automates the boring and tedious tasks of:
- Filling up the ``package.json``
- Setting up TypeScript and [Denoify](https://github.com/garronej/denoify).
- Writing a [README.md](https://github.com/garronej/denoify_ci/blob/dev/README.template.md) with decent presentation and instructions on how to install/import your module in different environments.
- Testing with multiple ``Node`` and ``Deno`` versions before publishing.
- Publishing on NPM and [deno.land/x](https://deno.land/x) ( via GitHub releases ).  

[Get started](https://github.com/garronej/denoify_ci)

**NEW v0.4.0**: Now that [deno.land/x](https://deno.land/x) allows to publish modules under a subdirectory of a GitHub repo
denoify no longer generate a `mod.ts` at the root of the project but under `deno_dist`. `deno_dist` should be stipulated 
as subdirectory when registering your module on [deno.land/x](https://deno.land/x).

# TODO LIST / Things that need to change

- [x] Support `myModule.deno.ts` alongside `myModule.ts` for deno specific implementation of part of the code. (Like in React Native)
- [x] Support custom `import/export` statements replacer.
- [x] 🔥 Leverage CDNs like [Skypack](https://www.skypack.dev) (ex [Pika](https://www.pika.dev/cdn)) or [jspm](https://jspm.org) to support more NPM modules out of the box, feature [side loading of type definitions](https://user-images.githubusercontent.com/6702424/85604253-6ae1a380-b651-11ea-9406-38bb57f190de.png). 
- [x] Support `.tsx`

# The sticker

<p align="center">
    <img src="https://user-images.githubusercontent.com/6702424/90624450-41d82c00-e218-11ea-8b02-e276e6ded303.png">
</p>
<p align="center">
    <a href="https://teespring.com/fr/denoify-sticker">Shop</a>  
</p>
   
