import { NextRequest, NextResponse } from "next/server";
import fetchRefreshToken from "./utils/auth/refresh";

export async function proxy(request: NextRequest) {

    function setAuthCookies(authAccessToken: string, authRefreshToken: string, accessExpiration: string, response: NextResponse) {
        request.cookies.set('AuthAccessToken', authAccessToken);
        request.cookies.set('AuthRefreshToken', authRefreshToken);
        request.cookies.set('AccessTokenExpiration', accessExpiration);

        response.cookies.set('AuthAccessToken', authAccessToken, { path: '/' });
        response.cookies.set('AuthRefreshToken', authRefreshToken, { path: '/', httpOnly: true, secure: false, sameSite: "lax" });
        response.cookies.set('AccessTokenExpiration', accessExpiration, { path: '/' });
    }

    async function logout(){
        return NextResponse.redirect(new URL('/api/auth/logout', request.url))
    }

    const nextResponse = NextResponse.next();
    const redirectResponse = NextResponse.redirect(new URL('/home', request.url));
    
    const authenticatedPaths = ["/home"];
    const authenticationPaths = ["/login", "/register"];

    const path = request.nextUrl.pathname;

    const authAccessToken = request.cookies.get("AuthAccessToken")?.value;
    const authRefreshToken = request.cookies.get("AuthRefreshToken")?.value;
    const expires = request.cookies.get("AccessTokenExpiration")?.value;
    const isExpired = expires ? new Date(expires) < new Date() : true;


    if (isExpired && authRefreshToken && authAccessToken) {
        try {
            const refreshResponse = await fetchRefreshToken({
                ApiURL: process.env.API_URL || '',
                AuthAccessToken: authAccessToken,
                AuthRefreshToken: authRefreshToken,
            })
            setAuthCookies(refreshResponse.AuthAccessToken, refreshResponse.AuthRefreshToken, refreshResponse.AccessTokenExpiration, nextResponse);
            setAuthCookies(refreshResponse.AuthAccessToken, refreshResponse.AuthRefreshToken, refreshResponse.AccessTokenExpiration, redirectResponse);
        }catch(error){
            return logout();
        }
    }

    if (request.cookies.has("AuthAccessToken") && authenticationPaths.includes(path)) {
        return redirectResponse;
    }

    if (!request.cookies.has("AuthAccessToken") && authenticatedPaths.includes(path)) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return nextResponse;

}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}