import { NextRequest, NextResponse } from "next/server";
import fetchRefreshToken from "./utils/auth/refresh";
import { permissionModuleSchema } from "./schemas/auth/permission/permissionModule";
import { verifyWithSchema } from "./services/token/verify";

export async function proxy(request: NextRequest) {
    //falta pegar prefetch rsc (paralelo, buga refreshtoken) e if para nao passar pelo proxy

    function setAuthCookies(authAccessToken: string, authRefreshToken: string, accessExpiration: string, response: NextResponse) {
        request.cookies.set('AuthAccessToken', authAccessToken);
        request.cookies.set('AuthRefreshToken', authRefreshToken);
        request.cookies.set('AccessTokenExpiration', accessExpiration);

        response.cookies.set('AuthAccessToken', authAccessToken, { path: '/' });
        response.cookies.set('AuthRefreshToken', authRefreshToken, { path: '/', httpOnly: true, secure: false, sameSite: "lax" });
        response.cookies.set('AccessTokenExpiration', accessExpiration, { path: '/' });
    }

    async function logout() {
        return NextResponse.redirect(new URL('/api/auth/logout', request.url))
    }

    const nextResponse = NextResponse.next();
    const redirectResponse = NextResponse.redirect(new URL('/home', request.url));

    const authenticatedPaths = ["/home"];
    const authenticationPaths = ["/login", "/register"];

    const path = request.nextUrl.pathname;

    //permissao
    if (authenticatedPaths.includes(path)) {
        const permissions = await verifyWithSchema<PermissionModule[]>(request.cookies.get("Permissions")?.value ?? '', permissionModuleSchema.array()).catch(() => {
            return null;
        });

        if (permissions === null) {
            //retorna null, o usuario tentou mexer no cookie de permission, ou foi removido, entao desloga o usuario para evitar problemas de acesso indevido
            return logout();
        }
    }

    const authAccessToken = request.cookies.get("AuthAccessToken")?.value;
    const authRefreshToken = request.cookies.get("AuthRefreshToken")?.value;
    const expires = request.cookies.get("AccessTokenExpiration")?.value;
    const isExpired = expires ? new Date(expires) < new Date() : true;


    if (isExpired && authRefreshToken && authAccessToken) {
        try {
            const refreshResponse = await fetchRefreshToken({
                ApiURL: process.env.API_URL || '',
                refreshToken: authRefreshToken,
            })
            setAuthCookies(refreshResponse.accessToken, refreshResponse.refreshToken, new Date(Date.now() + refreshResponse.expiresInSeconds * 1000).toISOString(), nextResponse);
            setAuthCookies(refreshResponse.accessToken, refreshResponse.refreshToken, new Date(Date.now() + refreshResponse.expiresInSeconds * 1000).toISOString(), redirectResponse);
        } catch (error) {
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