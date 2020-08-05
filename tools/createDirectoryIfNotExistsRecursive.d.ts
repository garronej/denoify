/** To support node < v10  we don't use fs.mkdir */
export declare function createDirectoryIfNotExistsRecursive(dirname: string): Promise<unknown>;
