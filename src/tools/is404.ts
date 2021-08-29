
import fetch from "node-fetch";

/** Return true if 404 or 400 */
export async function is404(url: string): Promise<boolean> {

    try {

        return await fetch(url, { "timeout": 2000 })
            .then(({ status }) => (status === 404 || status === 400));

    } catch {

        return true;

    }
}