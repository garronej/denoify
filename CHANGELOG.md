### **0.4.12** (2020-08-18)  
  
- Support rxjs  
- Update README.md    
  
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
  
