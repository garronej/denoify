import * as fs from "fs";

/** Save results of anterior calls */
export function addCache<T extends (...args: any[]) => Promise<any>>(f: T, params?: { filePathForPersistanceAcrossRun: string }): T {
    const previousResults: Record<string, [ReturnType<T>]> =
        params === undefined || !fs.existsSync(params.filePathForPersistanceAcrossRun)
            ? {}
            : JSON.parse(fs.readFileSync(params.filePathForPersistanceAcrossRun).toString("utf8"));

    if (params !== undefined) {
        process.once("exit", () =>
            fs.writeFileSync(
                params.filePathForPersistanceAcrossRun,
                Buffer.from(JSON.stringify(previousResults), "utf8") //TODO: reorder props
            )
        );
    }

    return async function callee(...args: Parameters<T>): Promise<any> {
        const key = shallowEqualStringifyInvariant(args);

        if (key in previousResults) {
            return previousResults[key][0] as any;
        }

        previousResults[key] = [await f(...args)];

        //NOTE: So that JSON.parse restore it well.
        if (previousResults[key][0] === undefined) {
            previousResults[key].pop();
        }

        return callee(...args);
    } as unknown as T;
}

/**

Two shallow equal object will return the same string.

assert(
    shallowEqualStringifyInvariant({ "p1": "foo", "p2": "bar" })
    ===
    shallowEqualStringifyInvariant({ "p2": "bar", "p1": "foo" })
);
*/
function shallowEqualStringifyInvariant(o: any): string {
    const s1 = JSON.stringify(o);

    const p1 = JSON.parse(s1);

    const p2: any = {};

    Object.keys(p1)
        .sort()
        .forEach(key => (p2[key] = p1[key]));

    return JSON.stringify(p2);
}
