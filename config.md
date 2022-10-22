# Config

### Configuration

`denoify` will search up the directory tree for the following file to read its configurations, in the order of priority

1. `package.json`
2. `.denoifyrc`
3. `.denoifyrc.json`
4. `.denoifyrc.yml`
5. `.denoifyrc.yaml`
6. `.denoifyrc.js`
7. `.denoifyrc.cjs`
8. `denoify.config.js`
9. `denoify.config.cjs`

### Options

#### replacer

* Type: `string?`

The function provided by users as a plugin that enable them to write custom logic that dictates how certain imports should be replaced

#### ports

* Type: `{ [portName: string]: string` `}`

#### out

* Type: `string?`
* Default: `deno_dist`

The directory for `denoify` to transpile to

#### index

* Type: `string?`
* Default: `src`

The entry point for `denoify` to output `mod.ts`

#### inclues

* Type: `string | { src: string, destDir?: string, destBasename?: string` }

### Recommendation

We strongly suggest to not use `package.json` as a configuration tool because it would reduce the readability of the `package.json` as it is stuff with unnecessary key-value pairs

We support `package.json` for backward compatibility purpose only
