import fetch from "node-fetch";

/** Return true if 404 or 400 */
export function is404(url: string): Promise<boolean> {
    return fetch(url, { "timeout": 8000 }).then(({ status }) => status === 404 || status === 400);
}
