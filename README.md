
<p align="center">
    <img src="https://user-images.githubusercontent.com/6702424/79351107-900eb300-7f38-11ea-8272-91ff725d29f3.png">
</p>
<p align="center">
    <i>🦕 Support Deno and release on NPM with a single codebase. 🦕</i>
</p>
<br>


**WARNING**: This is a pre release that might be broken in some way. Polished release coming soon.


# What it is

This tool takes as input a TypeScript codebase that was meant to target node and/or the web and spits out a modified version of the source files that are ready to be deployed as a Deno module.  
  
**Denoify does for deno what browserify does for the browser.**

# What it isn't

A way to import node module in Deno project. For that purpose you can try [CommonJS module Loading](https://github.com/denoland/deno/tree/master/std/node/#commonjs-module-loading)


# Motivations

Although it is quite easy to port a module to deno it is a chore to maintain two codebases.

# Example of modules using Denoify

Modules that have been made cross-runtime using Denoify:

- [evt](https://evt.land)
- [run-exclusive](https://github.com/garronej/run-exclusive)

# Will it work with my existing module ?

- Does your user need to have ``@types/node`` installed to use your module ? 
  If yes then, unfortunately, your module is not denoifiable as it is. 
  Even if you are allowed to use (some, not all) node builtins
  such as ``fs``, ``path`` or ``event`` you will need to remove all Node reference from your exposed API before you can use Denoify. 
  You can't for example expose a class that extends ``EventEmitter`` or if you do you will have to export a type definition for ``EventEmitter``.
- You will need to provide a Deno polyfill for each of your project dependencies that are not known by Denoify.
  [Here is the list](https://github.com/garronej/denoify/blob/master/knownPorts.jsonc) of modules for which Denoify has already a polyfill for.
  *Note that Denoify work recursively meaning that you can fork your dependencies repo and denoify them yourself.  
  However, depending on how deep your dependencies tree goes it might not be feasible.*
- Is your module a vanilla JS project. If yes you will have to port it into TypeScript first.

# Roadmap to 1.0

The project is at an early stage. Current TODO list; 

- Allows require() ( synchronous dynamical loading of modules )
- Using the typescript compiler API to parse source files instead of doing the change with RegExps. [ts-morph](https://github.com/dsherret/ts-morph) seems to be a good option here.
- Polyfills global node API that are not imported like Buffer and process. ( language parsing must land first )


# TUTORIALS

## Porting an existing project

Check out [this repo](https://github.com/garronej/my_dummy_npm_and_deno_module) to see in practice how to setup your denoify with your repo.

## Starting from scratch

Check out [denoify_ci](https://github.com/garronej/denoify_ci) a template that:
- Will setup itself: Just give your module a name and a description, a bot will push a commit setting everything up for you.
- Automate testing ( with github action ): Every commit pushed will be automatically tested on docker containers against many Node and Deno version, if everting passes you'll get a green label on the readme.
- Publish for you on NPM and Deno.land third party module repository: Each time you'll change the version number in ``package.json`` a workflow that will publishing for you on NPM and [deno.land](https://deno.land/x/) will trigger. The CHANGELOG.md will be automatically updated based on commit messages since last release.
- Enable you to only track sources on the main branch: With this template you won't have to track ``dist/`` and ``deno_dist`` on your main branch.
- Enable short import path and path consistency between NPM and Deno: No more ``import 'my_module/dist/lib/theFileNeeded'`` your users will be able to ``import 'my_module/theFileNeeded'``.  
