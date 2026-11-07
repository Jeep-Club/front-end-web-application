/** HTTPS is mandatory for cookies on deployed builds, including Vercel previews. */
export function authCookieOptions(httpOnly = false) {
    return {
        path: '/',
        httpOnly,
        secure: process.env.NODE_ENV === 'production' || process.env.NODE_SECURE === 'HTTPS',
        sameSite: 'lax' as const,
    };
}
