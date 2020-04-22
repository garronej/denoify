
<p align="center">
    <img src="https://user-images.githubusercontent.com/6702424/79351107-900eb300-7f38-11ea-8272-91ff725d29f3.png">
</p>
<p align="center">
    <i>🦕 Support Deno and release on NPM with a single codebase. 🦕</i>
</p>
<br>


This tool takes as input a TypeScript codebase that was meant to target node and/or the web and spits out a modified version of the source files that are ready to be deployed as a Deno module.  
  
**Denoify does for deno what browserify does for the browser.**

# Motivation

Although it is quite easy to port a module to deno it is a chore to maintain two codebases.

# (current) Limitations

At this stage of its development denoify has quite strict limitations:

- Only fixes ``import``/``export`` and thus only works on projects that do not use any node specific API like ``global``, ``process`` etc.  
- Only supports TypeScript projects.
- Dynamic imports using ``require()`` are not supported.

# Roadmap to 1.0

- ( in progress ) Create a JSON database of known ports that will be used by default so that users don't have to specify a port for EVERY dependency.
  Like browserify that uses [this](https://www.npmjs.com/package/events) when it encounter ``import { EventEmitter } from "events"``.
- Adds to this database the standard node modules ( like ``fs``, ``http``, ``util``, ``events`` ect )
- Using the typescript compiler API to parse source files instead of doing the change with ``RegExp``s.
  [ts-morph](https://github.com/dsherret/ts-morph) seems to be a good option here. 
- Polyfills global node API that are not imported like ``Buffer`` and ``process``. ( language parsing must land first ) 
- Allows ``require()`` ( synchronous dynamical loading of modules ) 

# Requirements
`
This section is just to give an idea of what has to be done to enable denoify to work.
A detailed example is provided later on.

## Bare

- All the ``*.ts`` files must be contained in a single directory at the root of your project ( typically ``src`` or ``lib`` ).
- The ``tsconfig.json`` must use the ``"compilerOptions"`` -> ``"outDir"`` option.
- All strict TS checks must be enabled in ``tsconfig.json`` ( ``"noUnusedLocals"``, ``"noUnusedParameters"`` and ``"strict"`` )
- You must provide a deno port for each of the dependencies that have not been made cross compatible with this module. **Example**: 
  - Your project depends on the NPM module ``"js-yaml"``: there is already a 1 to 1 port available -- you can specify the deno port ``"https://deno.land/x/js_yaml_port/js-yaml.js"``
  - Your project depends on the NPM module ``"run-exclusive"``: you don't have to specify a port as ``"run-exclusive"`` has been made cross-compatible with this module.
  - Your project depends on ``"ts-md5"``: you will have to fork the repo of the project and denoify the module yourself.

## For recursive resolution 

If you want to enable your module to be, in its turn, used as a dependency in projects using denoify.

- Your project must be hosted on GitHub and be public.
- The ``"repository"`` entry in the ``package.json`` file must be completed. ( ``npm`` gives a warning if it is not anyway )
- Each time you publish a release on NPM (``> npm publish``)  you must also create a new release on GitHub with tag name ``vX.Y.Z`` corresponding to your package json.

# Install

```bash
> npm install --save-dev garronej/denoify#0.1.0
```

# Setup

Check out [this repo](https://github.com/garronej/my_dummy_npm_and_deno_module/tree/v0.1.0) to see in practice how to setup your denoify with your repo.

# Real world example

Modules that have been made cross-compatible using denoify:

- [evt](https://evt.land)
- [run-exclusive](https://github.com/garronej/run-exclusive)
