import { fetchWithTimeout } from "../tools/fetchWithTimeout";

/** Return true if 404 or 400 */
export function is404(url: string): Promise<boolean> {
    return fetchWithTimeout(url, { "timeout": 8000 }).then(({ status }) => status === 404 || status === 400);
}
