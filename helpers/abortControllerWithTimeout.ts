export function getAbortControllerWithTimeout(ms: number) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);

    return { controller, timer };
}
