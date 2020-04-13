# denoify

```raw
$ npx garronej/denoify --help

Usage: denoify [options]

    A build tool to make node modules written in TypeScript cross compatible with Deno.

    It allow to support deno and all the other JS runtime environnement with a single codebase.

    At this stage of it's development this tools only fix import/export and thus will 
    only works on projects that do not use any node specific API like global, process ect...
    However it is enough to port a large quantity of libraries.

    You must provide a deno por for each of the dependencies that have not been made cross 
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
        "exclude": [
            "node_modules",
            "dist/**/*",
            "deno_dist/**/*", // You must exclude deno_dist

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
```