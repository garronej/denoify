const FILENAME_IS_USED = /(?:^|[\s\(\);=><{}\[\]\/:?,])__filename(?:$|[^a-zA-Z0-9$_-])/;

export const test = (sourceCode: string) => FILENAME_IS_USED.test(sourceCode);

export const modification = [
    `const __filename = (() => {`,
    `    const { url: urlStr } = import.meta;`,
    `    const url = new URL(urlStr);`,
    `    const __filename = (url.protocol === "file:" ? url.pathname : urlStr);`,
    ``,
    `    const isWindows = (() => {`,
    ``,
    `        let NATIVE_OS: typeof Deno.build.os = "linux";`,
    `        // eslint-disable-next-line @typescript-eslint/no-explicit-any`,
    `        const navigator = (globalThis as any).navigator;`,
    `        if (globalThis.Deno != null) {`,
    `            NATIVE_OS = Deno.build.os;`,
    `        } else if (navigator?.appVersion?.includes?.("Win") ?? false) {`,
    `            NATIVE_OS = "windows";`,
    `        }`,
    ``,
    `        return NATIVE_OS == "windows";`,
    ``,
    `    })();`,
    ``,
    `    return isWindows ?`,
    `        __filename.split("/").join("\\\\").substring(1) :`,
    `        __filename;`,
    `})();`,
    ``
];
