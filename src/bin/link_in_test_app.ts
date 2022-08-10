import { execSync } from "child_process";
import { join as pathJoin, relative as pathRelative } from "path";
import * as fs from "fs";

const denoifyDirPath = pathJoin(__dirname, "..", "..");

fs.writeFileSync(
    pathJoin(denoifyDirPath, "dist", "package.json"),
    Buffer.from(
        JSON.stringify(
            (() => {
                const packageJsonParsed = JSON.parse(fs.readFileSync(pathJoin(denoifyDirPath, "package.json")).toString("utf8"));

                return {
                    ...packageJsonParsed,
                    "main": packageJsonParsed["main"].replace(/^dist\//, ""),
                    "types": packageJsonParsed["types"].replace(/^dist\//, "")
                };
            })(),
            null,
            2
        ),
        "utf8"
    )
);

const commonThirdPartyDeps = (() => {
    const namespaceModuleNames: string[] = [];
    const standaloneModuleNames = ["tsafe", "evt"];

    return [
        ...namespaceModuleNames
            .map(namespaceModuleName =>
                fs
                    .readdirSync(pathJoin(denoifyDirPath, "node_modules", namespaceModuleName))
                    .map(submoduleName => `${namespaceModuleName}/${submoduleName}`)
            )
            .reduce((prev, curr) => [...prev, ...curr], []),
        ...standaloneModuleNames
    ];
})();

const yarnHomeDirPath = pathJoin(denoifyDirPath, ".yarn_home");

execSync(["rm -rf", "mkdir"].map(cmd => `${cmd} ${yarnHomeDirPath}`).join(" && "));

const execYarnLink = (params: { targetModuleName?: string; cwd: string }) => {
    const { targetModuleName, cwd } = params;

    const cmd = ["yarn", "link", ...(targetModuleName !== undefined ? [targetModuleName] : [])].join(" ");

    console.log(`$ cd ${pathRelative(denoifyDirPath, cwd) || "."} && ${cmd}`);

    execSync(cmd, {
        cwd,
        "env": {
            ...process.env,
            "HOME": yarnHomeDirPath
        }
    });
};

const testAppNames = [process.argv[2] ?? "my_dummy_npm_and_deno_module"] as const;

const getTestAppPath = (testAppName: typeof testAppNames[number]) => pathJoin(denoifyDirPath, "..", testAppName);

testAppNames.forEach(testAppName => execSync("yarn install", { "cwd": getTestAppPath(testAppName) }));

console.log("=== Linking common dependencies ===");

const total = commonThirdPartyDeps.length;
let current = 0;

commonThirdPartyDeps.forEach(commonThirdPartyDep => {
    current++;

    console.log(`${current}/${total} ${commonThirdPartyDep}`);

    const localInstallPath = pathJoin(
        ...[denoifyDirPath, "node_modules", ...(commonThirdPartyDep.startsWith("@") ? commonThirdPartyDep.split("/") : [commonThirdPartyDep])]
    );

    execYarnLink({ "cwd": localInstallPath });

    testAppNames.forEach(testAppName =>
        execYarnLink({
            "cwd": getTestAppPath(testAppName),
            "targetModuleName": commonThirdPartyDep
        })
    );
});

console.log("=== Linking in house dependencies ===");

execYarnLink({ "cwd": pathJoin(denoifyDirPath, "dist") });

testAppNames.forEach(testAppName =>
    execYarnLink({
        "cwd": getTestAppPath(testAppName),
        "targetModuleName": "denoify"
    })
);
