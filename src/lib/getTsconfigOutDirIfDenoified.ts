
import { Scheme } from "./Scheme";
import * as commentJson from "comment-json";
import fetch from "node-fetch";
import * as path from "path";

export const { getTsconfigOutDirIfDenoified } = (() => {

    async function isDenoified(
        params: { scheme: Scheme; }
    ): Promise<boolean> {

        const { scheme } = params;

        const urlToIndex = Scheme.buildUrl(scheme, {});

        let modTsRaw: string;

        try {

            modTsRaw = await fetch(urlToIndex)
                .then(res => res.text())
                ;


        } catch{


            return false;

        }


        if (!modTsRaw.match(/denoify/i)) {


            return false;
        }


        return true;

    }

    /** Asserts denoified module */
    async function getTsconfigOutDir(
        params: { scheme: Scheme }
    ): Promise<{ tsconfigOutDir: string; }> {

        const { scheme } = params;

        return {
            "tsconfigOutDir": path.normalize(
                commentJson.parse(
                    await fetch(
                        Scheme.buildUrl(
                            scheme,
                            { "pathToFile": "tsconfig.json" }
                        )
                    ).then(res => res.text())
                )["compilerOptions"]["outDir"]
            )
        };

    }

    async function getTsconfigOutDirIfDenoified(
        params: { scheme: Scheme; }
    ): Promise<{ tsconfigOutDir: string | undefined; }> {

        const { scheme } = params;

        if (!(await isDenoified({ scheme }))) {
            return { "tsconfigOutDir": undefined };
        }

        return getTsconfigOutDir({ scheme });

    }

    return { getTsconfigOutDirIfDenoified };


})();
