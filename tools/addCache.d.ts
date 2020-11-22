/** Save results of anterior calls */
export declare function addCache<T extends (...args: any[]) => Promise<any>>(f: T, params?: {
    filePathForPersistanceAcrossRun: string;
}): T;
