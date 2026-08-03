import { sign } from "@/services/token/sign";
import { cookies } from "next/headers";
import { mapMePermissionToModule } from "../permission/userPermission";

export async function me(
    me: MeResponse,
) {
    const cookieStore = await cookies();

    const permissions = mapMePermissionToModule(me.authorities)
    const permissionsToken = await sign(permissions);
    const meToSign: MeCookie = {
        userName: me.userName,
        userId: me.userId,
        sessionId: me.sessionId,
        sessionActive: me.sessionActive,
        expires: new Date(Date.now() + me.expiresInSeconds * 1000).toISOString(),
    }
    const meToken = await sign(meToSign);
    cookieStore.set('Me', meToken, { path: '/', httpOnly: true, secure: process.env.NODE_SECURE === 'HTTPS', sameSite: "lax" });
    cookieStore.set('Permissions', permissionsToken, { path: '/', httpOnly: true, secure: process.env.NODE_SECURE === 'HTTPS', sameSite: "lax" });
}