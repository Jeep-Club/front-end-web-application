/** Private server-to-server credential required by the backend access filter. */
export function getFrontendAccessHeaders(): Record<string, string> {
    const key = process.env.API_FRONTEND_KEY?.trim();
    return key ? { "X-Frontend-Key": key } : {};
}
