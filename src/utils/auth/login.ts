import { cookies } from "next/headers";

export async function login(
    accessToken: string,
    refreshToken: string,
    accessExpiration: string
) {
    const cookieStore = await cookies();
    cookieStore.set('AuthAccessToken', accessToken, { path: '/', expires: new Date(accessExpiration) });
    cookieStore.set('AuthRefreshToken', refreshToken, { path: '/', httpOnly: true, secure: false, sameSite: "lax" });
    cookieStore.set('AccessTokenExpiration', accessExpiration, { path: '/' });
}