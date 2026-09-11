import { sign } from "@/services/token/sign";
import { cookies } from "next/headers";
import { mapMePermissionToModule } from "../permission/userPermission";

export async function me(
    session: MeResponse,
    identity: IdentityMeResponse,
    authorization: AuthorizationMeResponse,
) {
    const cookieStore = await cookies();

    if (session.userId !== identity.id || session.userId !== authorization.userId) {
        throw new Error('Authenticated user contexts returned different identifiers');
    }

    const permissions = mapMePermissionToModule(authorization.authorities)
    const permissionsToken = await sign(permissions);
    const meToSign: MeCookie = {
        userName: identity.name,
        userId: session.userId,
        sessionId: session.sessionId,
        sessionActive: session.sessionActive,
        expires: new Date(Date.now() + session.expiresInSeconds * 1000).toISOString(),
    }
    const meToken = await sign(meToSign);
    cookieStore.set('Me', meToken, { path: '/', httpOnly: true, secure: process.env.NODE_SECURE === 'HTTPS', sameSite: "lax" });
    cookieStore.set('Permissions', permissionsToken, { path: '/', httpOnly: true, secure: process.env.NODE_SECURE === 'HTTPS', sameSite: "lax" });
}