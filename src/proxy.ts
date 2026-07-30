import { NextRequest, NextResponse } from "next/server";
import fetchRefreshToken from "./utils/auth/refresh";
import { permissionModuleSchema } from "./schemas/auth/permission/permissionModule";
import { verifyWithSchema } from "./services/token/verify";
import { routePermissions } from "./utils/permission/routePermissions";
import { meCookieSchema, meResponseSchema } from "./schemas/auth/me/me";
import { HttpAPIRoutes } from "./utils/http/api";
import { sign } from "./services/token/sign";
import { mapMePermissionToModule } from "./utils/permission/userPermission";
import { fetchWrapper } from "./services/fetchWrapper/fetchWrapper";

export async function proxy(request: NextRequest) {

    const path = request.nextUrl.pathname;

    const response = NextResponse.next();
    response.headers.set('x-route-pathname', path);

    if (request.method !== 'GET') {
        return response;
    }


    function setAuthCookies(authAccessToken: string, authRefreshToken: string, accessExpiration: string) {
        request.cookies.set('AuthAccessToken', authAccessToken);
        request.cookies.set('AuthRefreshToken', authRefreshToken);
        request.cookies.set('AccessTokenExpiration', accessExpiration);

        response.cookies.set('AuthAccessToken', authAccessToken, { path: '/' });
        response.cookies.set('AuthRefreshToken', authRefreshToken, { path: '/', httpOnly: true, secure: false, sameSite: "lax" });
        response.cookies.set('AccessTokenExpiration', accessExpiration, { path: '/' });
    }

    async function setMeCookies(me: MeResponse) {
        const permissions = mapMePermissionToModule(me.authorities)
        const permissionsToken = await sign(permissions);

        const meToSign: MeCookie = {
            userId: me.userId,
            sessionId: me.sessionId,
            sessionActive: me.sessionActive,
            expires: new Date(Date.now() + me.expiresInSeconds * 1000).toISOString(),
            userName: me.userName
        }
        const meToken = await sign(meToSign);
        request.cookies.set('Me', meToken);
        request.cookies.set('Permissions', permissionsToken);
        response.cookies.set('Me', meToken, { path: '/', httpOnly: true, secure: false, sameSite: "lax" });
        response.cookies.set('Permissions', permissionsToken, { path: '/', httpOnly: true, secure: false, sameSite: "lax" });
    }

    async function logout() {
        return NextResponse.redirect(new URL('/api/auth/logout', request.url), { headers: response.headers });
    }

    if (routePermissions[path]) {

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
                setAuthCookies(refreshResponse.accessToken, refreshResponse.refreshToken, new Date(Date.now() + refreshResponse.expiresInSeconds * 1000).toISOString());
            } catch (error) {
                return logout();
            }
        }

        try {
            const meToken = request.cookies.get("Me")?.value || '';
            const me = await verifyWithSchema<MeCookie>(meToken, meCookieSchema);
            if (new Date(me.expires) < new Date()) {
                const meResponse = await fetchWrapper<MeResponse>({
                    url: process.env.API_URL + '/' + HttpAPIRoutes.ME,
                    method: 'GET',
                    schema: meResponseSchema
                });
                setMeCookies(meResponse.data);
            }
        } catch (error) {
            return logout();
        }

    }

    return response;

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
        '/((?!api|_next/static|_next/image|favicon.ico|images/).*)',
    ],
    missing: [{ type: "header", key: "purpose", value: "prefetch" }],
}