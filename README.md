
<p align="center">
    <img src="https://user-images.githubusercontent.com/6702424/79351107-900eb300-7f38-11ea-8272-91ff725d29f3.png">
</p>
<p align="center">
    <i>🦕 Support Deno and release on NPM with a single codebase. 🦕</i>
</p>
<br>

This tool take as input a TypeScript codebase that was meant to target node and/or the web and spit out modified version of the sources files that are ready to be deployed as a Deno module.  
  
**Denoify do for deno what browserify do for the browser.**

# Motivation

Although it is quite easy to port a module to deno it is a chore to maintain two codebase.

# Limitations

At this stage of it's development denoify has quite strict limitations:

- Only fix ``import``/``export`` and thus only works on projects that do not use any node specific API like ``global``, ``process`` ect.  
- Only support TypeScript projects.
- Dynamic imports using ``require()`` are not supported.

# Requirements

This is just to give an idea of what has to be done to enable denoify to work.
A detailed example is provided later on.

## Bare

- All the ``*.ts`` files must be contained in a single directory at the root of your project ( typically ``src`` or ``lib`` ).
- The ``tsconfig.json`` must use the ``"compilerOptions"`` -> ``"outDir"`` option.
- All strict TS checks must be enabled in ``tsconfig.json`` ( ``"noUnusedLocals"``, ``"noUnusedParameters"`` and ``"strict"`` )
- You must provide a deno port for each of the dependencies that have not been made cross compatible with this module. **Example**: 
  - Your project depends on the NPM module ``"js-yaml"``: there is already a 1 to 1 port available you can specify the deno port ``"https://deno.land/x/js_yaml_port/js-yaml.js"``
  - Your project depend on the NPM module ``"run-exclusive"``: you don't have to specify a port as ``"run-exclusive"`` has been made cross compatible with this module.
  - Your project depend on ``"ts-md5"``: you will have to fork the repo of the project and denoify the module yourself.

## For recursive resolution 

If you want to enable your module to be, in it's turn, used as dependency in projects using denoify.

- Your project must be hosted on GitHub and be public.
- The ``"repository"`` entry of the ``package.json`` file must be completed. ( ``npm`` gives a warning if it is not anyway )
- Each time you publish a release on NPM (``> npm publish``)  you must also create a new release on github with tag name ``vX.Y.Z`` corresponding to your package json.

# Setup

Check out [this repo](https://github.com/garronej/denoify_example) to see in practice how to setup your denoify with your repo.

# Real world example

Modules that have been made cross compatible using denoify:

- [evt](https://evt.land)
- [run-exclusive](https://github.com/garronej/run-exclusive)
