
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

_NOTICE_: The tool will be officially introduced at the next [Deno Paris](https://deno.paris) and 
[Deno Israel](https://www.meetup.com/DenoIsrael/events/270885478/) meetups.

# What it is

This tool takes as input a TypeScript codebase that was meant to target node and/or the web and spits out a modified version of the source files that are ready to be deployed as a Deno module.  
  
**Denoify does for Deno what browserify does for the browser.**

# What it isn't

A way to import node modules in Deno projects. For that purpose you can try [CommonJS module Loading](https://github.com/denoland/deno/tree/master/std/node/#commonjs-module-loading)

# Motivations

- Although it is quite easy to port a module to Deno no wants to maintain two codebase.
- Wouldn't it be great to have a tool able to make all the major NPM modules available to Deno?

# Example of modules using Denoify

Modules that have been made cross-runtime using Denoify:

- [EVT](https://evt.land)
- [run-exclusive](https://github.com/garronej/run-exclusive)

# Limitations

Coming up next is a detailed guide on how to set up denoify with your project and how
to publish on [deno.land/x](https://deno.land/x) but before anything
here are the current limitations you need to be aware of.

- If your module is vanilla JS it needs to be ported to TypeScript first. (1)
- Not all Node's builtin are supported yet. (2)
- You will need to fork and denoify(3) manually each of your module's (not dev) dependencies. 
- For the dependencies that can't easily be denoified you will need to write a
  partial Deno port of the bits your module needs.
- `require()` is not yet supported.
- You can't (yet) `fs.readFile` files that are part of the module ( files inside a ``res/`` 
  directory for example ). (4)

(1) *Don't be afraid, renaming your source with ``.ts`` and dropping some ``any`` here 
and there will do the trick.
You will be able to pull it off even if you aren't familiar with typescript. [Ref](https://github.com/garronej/my_dummy_npm_and_deno_module#enable-strict-mode-and-fixes-errors-if-any)*

(2) *You can consult [here](https://deno.land/std/node#supported-builtins) the current state of the Node's builtin support.*

(3) *Glossary: To 'denoify' a module is the process of using this tool to generate a deno 
distribution of a module and to publish this distribution on GitHub. 
How to do that is documented in great details.*

(4) *In Deno the files that form your module won’t be pre-fetched and 
placed in ``node_module`` like in node so you won’t be able to access files that are not 
on the disk.

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
