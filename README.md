
<p align="center">
    <img src="https://user-images.githubusercontent.com/6702424/79351107-900eb300-7f38-11ea-8272-91ff725d29f3.png">
</p>
<p align="center">
    <i>🦕 Support Deno and release on NPM with a single codebase. 🦕</i>
    <br>
    <br>
    <img src="https://github.com/garronej/denoify/workflows/ci/badge.svg">
</p>
<br>

**WARNING**: This is a pre-release that might be broken in some ways. Stay tuned.

# What it is

This tool takes as input a TypeScript codebase that was meant to target node and/or the web and spits out a modified version of the source files that are ready to be deployed as a Deno module.  
  
**Denoify does for Deno what browserify does for the browser.**

# What it isn't

A way to import node modules in Deno projects. For that purpose you can try [CommonJS module Loading](https://github.com/denoland/deno/tree/master/std/node/#commonjs-module-loading)

# Motivations

- Although it is quite easy to port a module to Deno it is a chore to maintain two codebase.
- Wouldn't it be great to have a tool able to make all the major NPM modules available to Deno?

# Example of modules using Denoify

Modules that have been made cross-runtime using Denoify:

- [EVT](https://evt.land)
- [run-exclusive](https://github.com/garronej/run-exclusive)

# Will it work with my module ?

At this stage of it's development, Denoify set quite restrictive requirements:   

- Does your users need to have ``@types/node`` installed to use your module ? 
  If yes then, unfortunately, your module is not denoifiable as it is. 
  Even if you are allowed to use (some, not all) node builtins
  such as ``fs``, ``path`` or ``event`` you will need to remove all Node reference from your exposed API before you can use Denoify. 
  You can't for example expose a class that extends ``EventEmitter`` or if you do you will have to export a type definition for ``EventEmitter``.
- You will need to provide a Deno polyfill for each of your project dependencies that are not known by Denoify.
  [Here is the list](https://github.com/garronej/denoify/blob/master/known-ports.jsonc) of modules for which Denoify has already a polyfill for.
  *Note that Denoify work recursively meaning that you can fork your dependencies repo and Denoify them yourself.  
  However, depending on how deep your dependency tree goes it might not be feasible.*
- Is your module a vanilla JS project? If yes you will have to port it into TypeScript first.

# Roadmap to 1.0

These are the milestone that, when achieved, will enable Denoify to work transparently on most NPM modules:  

- Supporting all node builtins, everything on [this list](https://deno.land/std/node#supported-builtins) should be
  checked ( help more than welcome ).
- Supporting ``require()`` and ``fs`` ( synchronously or not ) for dynamically accessing files of the project
  ( files that sits in the node_modules directory in Node ). Note that ``fs`` for the most part is already functional
  but the problem arises when trying to access files that are not present on the disk. In Deno unlike in Node,
  the packages files are not present on the disk at runtime. Fetching them synchronously is not a satisfactory solution
  for obvious reasons. We can do it the way Browserify is doing it but this approach works only if the paths 
  can be analyzed statically. The solution would be to provide a way for the user to define the files that are
  susceptible to be accessed synchronously at runtime or by default pre-loading everything in a single files if the
  project is using ``require`` or ``fs``.
- The changes are currently performed with RegExp, we need to use the TypeScript compiler API if we want
  the tool to be fully reliable. [ts-morph](https://github.com/dsherret/ts-morph) seems to be a good option here.
- Support Javascript projects and automatically bundle types from ``DefinitelyTyped`` ( also applicable for 
  ``@types/node`` ).
- Automatically Denoify dependencies ( require all the previous milestone ).

# GUIDES

## Setting up on an existing project

Check out [this repo](https://github.com/garronej/my_dummy_npm_and_deno_module) to see in practice how to set up Denoify in your project.

## Starting a project from scratch

![denoify_ci](https://user-images.githubusercontent.com/6702424/82036935-c52a3480-96a1-11ea-9794-e982a23e5612.png)

[denoify_ci](https://github.com/garronej/denoify_ci) is a template repo that automate the boring and tedious tasks of:
- Filling up the ``package.json``
- Setting up Typescript and [Denoify](https://github.com/garronej/denoify).
- Writing a [README.md](https://github.com/garronej/denoify_ci/blob/dev/README.template.md) with decent presentation and instructions on how to install/import your module.
- Testing on multiples ``Node`` and ``Deno`` version before publishing.
- Maintaining a CHANGELOG
- Publishing on NPM and [deno.land/x](https://deno.land/x) on your behalf.
