import fetch from "node-fetch";

export async function fetchWithTimeout(url: string, options: { timeout: number }) {
    const controller = new AbortController();
    const timer = setTimeout(() => {
        controller.abort();
    }, options.timeout); // Timeout set to 8000 ms

    let fetchResponse;

    try {
        fetchResponse = await fetch(url, {
            signal: controller.signal
        });
    } catch (err) {
        throw err;
    } finally {
        clearTimeout(timer);
    }

    return fetchResponse;
}
