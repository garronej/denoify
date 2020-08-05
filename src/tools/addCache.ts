
import * as fs from "fs";


/** Save results of anterior calls */
export function addCache<T extends (...args: any[]) => Promise<any>>(
    f: T,
    params?: { filePathForPersistanceAcrossRun: string; }
): T {

    const previousResults: Record<string, [ ReturnType<T> ]> =
        (
            params === undefined ||
            !fs.existsSync(params.filePathForPersistanceAcrossRun)
        ) ? {} : JSON.parse(
            fs.readFileSync(params.filePathForPersistanceAcrossRun)
                .toString("utf8")
        );

    if (params !== undefined) {

        process.once("exit", () =>
            fs.writeFileSync(
                params.filePathForPersistanceAcrossRun,
                Buffer.from(JSON.stringify(previousResults), "utf8")
            )
        );

    }

    return (async function callee(...args: Parameters<T>): Promise<any> {

        const key = JSON.stringify(args);

        if (key in previousResults) {
            return previousResults[key][0] as any;
        }

        previousResults[key] = [ await f(...args) ];

        //NOTE: So that JSON.parse restore it well.
        if( previousResults[key][0] === undefined ){
            previousResults[key].pop();
        }

        return callee(...args);

    }) as unknown as T;


}