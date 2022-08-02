/** Equivalent of String.prototype.replace but with async replacer is async */
export async function replaceAsync(str: string, regex: RegExp, replacerAsync: (str: string, ...args: any[]) => Promise<string>) {
    const promises: Promise<string>[] = [];

    str.replace(regex, (match, ...args) => {
        const promise = replacerAsync(match, ...args);
        promises.push(promise);
        return "";
    });

    const data = await Promise.all(promises);

    return str.replace(regex, () => data.shift()!);
}
