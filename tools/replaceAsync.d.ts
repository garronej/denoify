/** Equivalent of String.prototype.replace but with async replacer is async */
export declare function replaceAsync(str: string, regex: RegExp, replacerAsync: (str: string, ...args: any[]) => Promise<string>): Promise<string>;
