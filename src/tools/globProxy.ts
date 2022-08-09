import * as glob from "glob";

export function globProxyFactory(params: { cwdAndRoot: string }) {
    const { cwdAndRoot } = params;

    function globProxy(params: { pathWithWildcard: string }): Promise<string[]> {
        const { pathWithWildcard } = params;
        return new Promise<string[]>((resolve, reject) =>
            glob(
                pathWithWildcard,
                {
                    "cwd": cwdAndRoot,
                    "root": cwdAndRoot,
                    "dot": true
                },
                (er, files) => {
                    if (!!er) {
                        reject(er);
                        return;
                    }
                    resolve(files);
                }
            )
        );
    }

    return { globProxy };
}
