import 'server-only';

/** Private server credential. Never import this module into a client component. */
export function frontendHeaders(headers?: HeadersInit): Record<string, string> {
    const result = Object.fromEntries(new Headers(headers).entries());
    // Callers cannot override the credential with a browser-supplied header.
    delete result['x-frontend-key'];
    const key = process.env.API_FRONTEND_KEY;
    if (key) {
        result['x-frontend-key'] = key;
    } else if (process.env.NODE_ENV === 'production') {
        throw new Error('API_FRONTEND_KEY is not configured');
    }
    return result;
}
