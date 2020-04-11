
/** Save results of anterior calls */
export function addCache<T extends (...args: any[]) => Promise<any>>(f: T): T {

    const previousResults = new Map<string, ReturnType<T>>();

    return (async function callee(...args: Parameters<T>): Promise<any>{

        const key= JSON.stringify(args);

        if( previousResults.has(key) ){
            return previousResults.get(key) as any;
        }

        previousResults.set(key, await f(...args));

        return callee(...args);

    }) as unknown as T;

}