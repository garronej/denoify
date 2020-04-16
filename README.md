
<p align="center">
    <img src="https://user-images.githubusercontent.com/6702424/79351107-900eb300-7f38-11ea-8272-91ff725d29f3.png">
</p>
<p align="center">
    <i> A build to support Deno and release on NPM with a single codebase.</i>
</p>
<br>

This tool take as input a TypeScript codebase that was meant to target node or the web and spit out modified version of the sources files that are ready to be deployed as a Deno module.  
  
**Denoify do for deno what browserify do for the browser.**

# Motivation

Although it is quite easy to port a module to deno it is a chore to maintain two codebase. For many project there is not that many change that need to be made on the source files to be compatible with deno.

# Limitations

At this stage of it's development denoify has quite strict limitations:

- Only fix ``import``/``export`` and thus only works on projects that do not use any node specific API like ``global``, ``process`` ect.  
- Only support TypeScript projects.
- Dynamic imports using ``require()`` are not supported.

# Requirements

## Bare

- All the ``*.ts`` files must be contained in a single directory at the root of your project ( typically ``src`` or ``lib`` ).
- The ``tsconfig.json`` must use the ``"compilerOptions"`` -> ``"outDi"`` option.
- All strict TS checks must be enabled in ``tsconfig.json`` ( ``"noUnusedLocals"``, ``"noUnusedParameters"`` and ``"strict"`` )
- You must provide a deno port for each of the dependencies that have not been made cross compatible with this module, example: 
  - If your project use the NPM module ``"js-yaml"``, there is already a 1 to 1 port available you can specify the deno port ``"https://deno.land/x/js_yaml_port/js-yaml.js"``
  - If your project use the NPM module ``"run-exclusive"`` you don't have to specify a port as ``"run-exclusive"`` has been made cross compatible with this module.
  - If your project use ``"ts-md5"`` you can fork ``https://github.com/cotag/ts-md5`` denoify it yourself then import it in your project using ``"ts-md5": "github:[your_name_or_org]/ts-md5[@optionally_branch_or_commit_sha]`` in your ``package.json``

## For recursive resolution 

If you want that to enable your module to be, in it's turn, used as dependency in projects using denoify

- Your project must be hosted on GitHub and be public.
- The ``"repository"`` entry of the ``package.json`` file must be completed.
- Each time you publish a release on NPM (``> npm publish``)  you must also create a new release on github with tag name ``vX.Y.Z`` corresponding to your package json.

# Setup

Check out [this repo](https://github.com/garronej/denoify_example) to see in practice how to setup your denoify with your repo.

# Real world example

Modules that have been made cross compatible using denoify:

- [evt](https://evt.land)
- [run-exclusive](https://github.com/garronej/run-exclusive)



```raw
> npx garronej/denoify --help

Usage: denoify [options]

    A build tool to make node modules written in TypeScript cross compatible with Deno.

    It allow to support deno and all the other JS runtime environnement with a single codebase.

    At this stage of it's development this tools only fix import/export and thus will 
    only works on projects that do not use any node specific API like global, process ect...
    However it is enough to port a large quantity of libraries.

    You must provide a deno port for each of the dependencies that have not been made cross 
    cross compatible with this module:

    Example: 
        - If your project use: "js-yaml" you can specify the deno port "https://deno.land/x/js_yaml_port/js-yaml.js"
        - If your project use "run-exclusive" you don't have to specify a port as "run-exclusive" has been made cross compatible with this module.

    If you are not the author of a dependency you can fork it on github and denoify it yourself.

    (garronej/denoify) /res/my-module contain an example module with denoify setup.
    You can also have a look at:
    - https://www.npmjs.com/package/evt OR
    - https://www.npmjs.com/package/run-exclusive
    Two package that have been made cross compatible using denoify.

    Here is how a project should be setup to work with denoify:

    package.json:
    {
        "name": "my-module",
        "main": "./dist/lib/index.js",
        ...
        "dependencies": {
            "run-exclusive": "^2.1.6", 
            "js-yaml": "^3.13.1"
        }
        ...
        "deno": {
            //Url to specify so other package using "my-module" can be made cross compatible with denoify.
            "url": "https://deno.land/x/my_module" //Or https://raw.githubusercontent.com/[user/org]/my-module/[commit hash or 'master']/ 
            "dependenciesPorts": {
                "js-yaml": "https://deno.land/x/js_yaml_port/js-yaml.js" 
            }
        },
        ...
        "scripts" {
            "tsc": "npx tsc",
            "denoify": "npx denoify",
            "build": "npm run tsc && npm run denoify"
        },
        ...
        "devDependencies": {
            "denoify": "github:garronej/denoify"
        }
        "files": [ // If you cherry-pick the files included in the npm bundle you must include tsconfig
            "/dist/lib",
            "/src/lib",
            "/tsconfig.json"
        ]

    }

    tsconfig.json:
    {
        ...
        "compilerOptions": {
            ...
            "outDir": "./dist", // Must use the outDir option
            ...
        },
        "filesGlob": [
            "src/**/*"
        ],
        "exclude": [ // Must also use explicit exclude to ignore ts files generated for deno.
            "node_modules",
            "dist/**/*",
            "deno_dist/**/*", 
            "./mod.ts" 
        ]
    }

    When running '$ npm run denoify', './deno_dist' alongside with './mod.ts'
    
    Examples of transformations that will take place from ./src to ./deno_dist

    import { Cat } from "./interfaces/Cat"                      => import { Cat } from "./interfaces/Cat.ts"
    import { Cat } from "./interfaces"                          => import { Cat } from "./interfaces/index.ts"
    import { load } from "js-yaml"                              => import { load } from "https://deno.land/x/js_yaml_port/js-yaml.js"
    import * as runExclusive from "run-exclusive"               => import * as runExclusive from "https://deno.land/x/run_exclusive/mod.js"
    import { build } from "run-exclusive/dist/lib/runExclusive" => import { build } from "https://deno.land/x/run_exclusive/deno_dist/lib/runExclusive.ts"

    The mod.ts file will contain 'export * from "./deno_dist/lib/index.ts";' ( path computed from package.json->main )

    The devDependencies does not necessarily have to be met.
    

Options:
  -p, --project [projectPath]  Default: './' -- Denoify the project given to a folder with a 'package.json' and 'tsconfig.json'.
  --src [srcDirPath]           Default: '[projectPath]/src' | '[projectPath]/lib' -- Path to the directory containing the source .ts files.
  -h, --help                   output usage information
```
