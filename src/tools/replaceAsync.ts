/** Equivalent of String.prototype.replace but with async replacer is async */
// eslint-disable-next-line max-params -- we're mimicking the signature of String.prototype.replace, so we ignore this rule
export async function replaceAsync(str: string, regex: RegExp, replacerAsync: (str: string, ...args: any[]) => Promise<string>) {
    const promises: Promise<string>[] = [];

    // eslint-disable-next-line max-params -- we're mimicking the signature of String.prototype.replace, so we ignore this rule
    str.replace(regex, (match, ...args) => {
        const promise = replacerAsync(match, ...args);
        promises.push(promise);
        return "";
    });

    const data = await Promise.all(promises);

    return str.replace(regex, () => data.shift()!);
}
