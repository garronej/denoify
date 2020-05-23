
import fetch from "node-fetch";

export function is404(url: string): Promise<boolean> {
    return fetch(url).then(({ status }) => status === 404);
}