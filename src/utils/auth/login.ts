import { cookies } from "next/headers";
import { authCookieOptions } from './cookieOptions';

export async function login(
    accessToken: string,
    refreshToken: string,
    accessExpiration: string,
) {
    const cookieStore = await cookies();
    cookieStore.set('AuthAccessToken', accessToken, authCookieOptions());
    cookieStore.set('AuthRefreshToken', refreshToken, authCookieOptions(true));
    cookieStore.set('AccessTokenExpiration', accessExpiration, authCookieOptions());
}
