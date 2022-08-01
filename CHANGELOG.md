### **0.11.7** (2022-08-01)  
  
- Make enableShortNpmImportPath script work with tsproject.json  
- Merge pull request #46 from GervinFung/denoify-typo

fix(typo): typo in help of argument message  
- fix(typo): typo in help of argument message    
  
### **0.11.6** (2022-07-26)  
  
- Update garronej_modules_update    
  
### **0.11.5** (2022-07-26)  
  
- Update dependency evt to ^2.3.0    
  
### **0.11.4** (2022-07-24)  
  
- Update dependency evt to ^2.2.2    
  
### **0.11.3** (2022-07-23)  
  
- Update dependency evt to ^2.2.1  
- Merge pull request #33 from garronej/renovate/configure

Configure Renovate  
- Update renovate.json  
- Update renovate.json  
- Update renovate.json  
- Update renovate.json  
- Update renovate.json  
- Add renovate.json    
  
### **0.11.2** (2022-07-17)  
  
  
  
### **0.11.1** (2022-06-16)  
  
- Merge pull request #43 from garronej/update-ts

Update TypeScript and Workflows  
- Remove Trailing spaces  
- Don not run ci.yaml on pull_request  
- Remove Trailing spaces  
- Update nodejs matrix versions  
- Create public github action  
- Update typescript  
- Update package-lock.json    
  
## **0.11.0** (2022-01-26)  
  
- Add many new Node API    
  
### **0.10.6** (2021-12-31)  
  
- Merge pull request #36 from DomThePorcupine/fix-index-option

Fix indexFilePath option  
- Fix indexFilePath option    
  
### **0.10.5** (2021-10-04)  
  
- Add fp-ts in known ports    
  
### **0.10.4** (2021-09-30)  
  
- Feat a script for removing deno dist from .gitignore    
  
### **0.10.3** (2021-09-30)  
  
- Feat: Explicitely tell where index.ts is located in the source    
  
### **0.10.2** (2021-09-30)  
  
- Support module augmentation    
  
### **0.10.1** (2021-09-30)  
  
  
  
## **0.10.0** (2021-09-29)  
  
- Mittigate the risk of comments beeing modified    
  
### **0.9.3** (2021-09-29)  
  
- Feat: Specify output dir in package.json denoify field    
  
### **0.9.2** (2021-09-29)  
  
- Print minimal log of what is happening    
  
### **0.9.1** (2021-09-02)  
  
- Merge pull request #32 from zxch3n/fix-remove-tsout-requirement

tsconfig.json can be absent if outputDir is specified  
- refactor: simplify code in genModFile  
- fix: remove dep that tsconfig must have outDir    
  
## **0.9.0** (2021-08-29)  
  
- Remove temporarly disable tests since deno.land is acting iraticly  
- If the server dosen't respond, assume 404  
- Merge pull request #31 from zxch3n/feat-config-output

feat: output dir config & remove dep on pkg 'main'  
- chore: correct option doc  
- chore: fix typo  
- feat: output dir config & remove dep on pkg 'main'    
  
## **0.8.0** (2021-08-09)  
  
- Merge pull request #30 from yandeu/master

Support for esm modules  
- Update node versions in workflow  
- Support for esm modules    
  
### **0.7.2** (2021-05-27)  
  
- Add node console    
  
### **0.7.1** (2021-05-09)  
  
- Update instructions for GitHub Actions  
- Merge pull request #28 from andreswebs/master

fix dead link  
- fix dead link    
  
## **0.7.0** (2021-05-05)  
  
- Add child_process  
- #23: Support for yarn workspaces / when the dependencies are installed in a parent directory  
- fmt  
- Update documentaion (rate limit exceeded)  
- Improve wording on command line arguments  
- Merge pull request #24 from hayes/patch-1

Fix arg parsing  
- Fix arg parsing    
  
### **0.6.5** (2021-02-21)  
  
- Bump version (chagelog ignore)    
  
### **0.6.4** (2020-12-20)  
  
- Add "stream" 🎉  
- Delete CNAME    
  
### **0.6.3** (2020-11-22)  
  
- Add documentation and homepage  
- Setup documentation website docs.denoify.land  
- Create CNAME  
- Update README.md    
  
### **0.6.2** (2020-11-10)  
  
- Add builtin support for reflect-metadata    
  
### **0.6.1** (2020-11-04)  
  
- Add some support for 'crypto' node builtin  
  
## **0.6.0** (2020-11-04)  
  
- Allow console.log in replacer  
- Support graphql  
- Add graphql-helix to the list of modules using denoify    
  
### **0.5.12** (2020-11-03)  
  
- Fix: Recognize import staring with // as url imports    
  
### **0.5.11** (2020-11-03)  
  
- Fix custom replacer, import with new lines    
  
### **0.5.10** (2020-09-28)  
  
- Merge pull request #17 from marcushultman/rxjs-ws

add support for rxjs/webSocket in replacer  
- add support for rxjs/webSocket in replacer

use skypack CDN with `X-TypeScript-Types` header support    
  
### **0.5.9** (2020-09-20)  
  
  
  
### **0.5.8** (2020-09-20)  
  
- Makes __dirname and __filename work on Windows    
  
### **0.5.6** (2020-09-20)  
  
- Properly copy files over deno_dist on windows, fixes #16  
- Respect case when copying files over to deno_dist    
  
### **0.5.5** (2020-09-14)  
  
- Add "url" and "assert" support (node builtin modules)  
  
### **0.5.3** (2020-09-06)  
  
- Fix replacer for Windows #13  
- Merge pull request #12 from divy-work/patch-1
- feat: add yolk to the list of examples https://github.com/nestdotland/yolk    
  
## **0.5.0** (2020-08-26)  
  
- // @denoify-ignore (with a space) work with a space as well that without it #11  
- BREAKING CHANGE, all denoify params gathered in a single package.json field, pick the files to includes in deno_dist #11  
  
### **0.4.14** (2020-08-20)  
  
- Copy LICENSE in deno_dist #11  
  
### **0.4.12** (2020-08-18)  
  
- Support rxjs  
  
### **0.4.11** (2020-08-18)  
  
- Enable exclude files from NPM bundle via the 'files' field of package.js    
  
### **0.4.10** (2020-08-17)  
  
- Bug fix with .deno.ts    
  
### **0.4.9** (2020-08-17)  
  
- Update README.md doc    
  
### **0.4.8** (2020-08-17)  
  
- Merge pull request #9 from yandeu/patch-1

Added Nano JSX to README.md  
- Added Nano JSX to README.md

I have added my project Nano JSX to the "Example of modules using Denoify" section. It is a SSR first, lightweight 1kB JSX library that works on Node and Deno. I have used Denoify to publish the entire code to deno.land/x.  
- Support *.deno.ts  
- Improve parser  
- fix parser    
  
### **0.4.7** (2020-08-16)  
  
- Imrove ReactDom support (for isomorphic web apps)  
- tsx support    
  
### **0.4.6** (2020-08-12)  
  
- Pass the source file path to import statements remplacers    
  
### **0.4.5** (2020-08-12)  
  
- Support react-dom    
  
### **0.4.4** (2020-08-11)  
  
- Support react    
  
### **0.4.3** (2020-08-11)  
  
- Support fast-xml-parser    
  
### **0.4.2** (2020-08-11)  
  
- improve proof of concept for custom remplacer    
  
### **0.4.1** (2020-08-10)  
  
- fix script for enabeling short import path, we can now have a unik dist TAG for node and deno    
  
## **0.4.0** (2020-08-10)  
  
- mod.ts no longer in root but in deno_dist    
  
### **0.3.8** (2020-08-09)  
  
- update cache    
  
### **0.3.7** (2020-08-05)  
  
- fix regular expression edge case    
  
### **0.3.6** (2020-08-05)  
  
- fix previous version    
  
### **0.3.5** (2020-08-05)  
  
- Fix: Forget to publish some files in previous release    
  
  
### **0.3.4** (2020-08-05)  
  
- emergency patch for the new deno.land/x mechanism
- Provide a way to scrip how import/export statement are transformed  
  
### **0.3.3** (2020-07-04)  
  
- Improve node builtins usage detection (less false positive)    
  
### **0.3.2** (2020-06-24)  
  
- Add RxJS in known ports    
  
### **0.3.1** (2020-06-24)  
  
- Improve non-explicitly imported builtins matching    
  
## **0.3.0** (2020-06-23)  
  
- More carefully check if Buffer is really user before including the Polyfill  
- drop node v8 support  
- std/node version freeze (use latest version when compiling), support `default_version`, stop assuming master is the default branch    
  
### **0.2.22** (2020-06-13)  
  
- add Buffer support  
- Support for node < v10  
- Generated import path consistency Windows/Posix  
- Notice about Buffer support  
- Fix typo  
- Adding visual demo of what denoify does  
- Fix typo  
- What it isn't wasn't relevant    
  
### **0.2.21** (2020-06-01)  
  
- Generated import path consistency Windows/Posix    
  
### **0.2.20** (2020-05-31)  
  
- Fix previous broken release #5    
  
### **0.2.19** (2020-05-31)  
  
- Windows compat #5    
  
### **0.2.18** (2020-05-30)  
  
- Improve error message #4  
- Minor readme fixes  
  
### **0.2.17** (2020-05-29)  
  
- Preparing readme for meetup groups    
  
### **0.2.16** (2020-05-29)  
  
- Removes from README warning against exposing API using Node.js's builtins. ( No longer relevant )  
- Remove the warning  
- Update EVT    
  
### **0.2.15** (2020-05-25)  
  
- Pre NPM publish script: Infer if we should move the .ts files alongside the .js files from the package.json's types argument, by default do not move    
  
### **0.2.14** (2020-05-25)  
  
- NPM publish script: Let the user decide if using the source .ts files or .d.ts. Better debugging experience vs TS version retrocompat
  
### **0.2.13** (2020-05-23)  
  
- Fix: Do not introduce absolute path in modified package.json ( enableShortNpmImportPath.ts )    
  
### **0.2.12** (2020-05-23)  
  
- Not using deprecated raw.github.com, using raw.githubusercontent.com instead  
- Track missing files  
- enableShortNpmImportPath move source as well and support source map  
- Performance improvement    
  
### **0.2.11** (2020-05-21)  
  
- improve resolve mechanism  
- Inform that __filename and __dirname are supported  
- Update README.md  
- Defines challenges and set goals    
  
### **0.2.10** (2020-05-19)  
  
- new minor version  
- Fix version version resolution  
- Fix bug ing GitHub url in url parsing  
- Include TextEncode and TextDecode in node 'util' port  
- Remove useless downlevelIteration when targeting es2018  
- fix resolution  
- target ES2018  
  
### **0.2.9** (2020-05-18)  
  
- bug fix: EVT is a hard dependency, not a dev-dep    
  
### **0.2.8** (2020-05-17)  
  
- Use published version of scripting-tool    
  
### **0.2.7** (2020-05-17)  
  
- fix know-ports.jsonc not included in NPM package  
- rename knownPorts.jsonc -> known-ports.jsonc  
- use npm ci instead of npm install in workflow  
  
### **0.2.6** (2020-05-17)  
  
- Use a specific version of garronej/scripting-tools  
- indent package.json using 4 spaces to be consistent  
- implement CI
  
