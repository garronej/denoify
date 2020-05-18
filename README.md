
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

- Although it is quite easy to port a module to Deno it is a chore to maintain two codebases.
- Wouldn't it be great to have a tool able to make all the major NPM modules cross-compatible with Deno?

# Example of modules using Denoify

Modules that have been made cross-runtime using Denoify:

- [evt](https://evt.land)
- [run-exclusive](https://github.com/garronej/run-exclusive)

# Will it work with my module ?

At this stage of it's devloppement, Denoify set quite restrictive requirements:   

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

- Allows require() ( synchronous dynamic loading of modules )
- Using the typescript compiler API to parse source files instead of making the change with RegExps. [ts-morph](https://github.com/dsherret/ts-morph) seems to be a good option here.
- Polyfills global node API that are not imported like Buffer and process. (\__dirname and \__filename already supported)
- Support Javascript projects.

# TUTORIALS

## Porting an existing project

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

