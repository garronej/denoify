
import * as glob from "glob";

export function globProxyFactory(
    params: {
        cwdAndRood: string;
    }
) {

    const { cwdAndRood } = params;

    function globProxy(
        params: {
            pathWithWildcard: string
        }
    ): Promise<string[]> {
        const { pathWithWildcard } = params;
        return new Promise<string[]>(
            (resolve, reject) =>
                glob(
                    pathWithWildcard,
                    {
                        "cwd": cwdAndRood,
                        "root": cwdAndRood,
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