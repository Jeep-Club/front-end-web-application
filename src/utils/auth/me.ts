import { sign } from "@/services/token/sign";
import { cookies } from "next/headers";
import { mapMePermissionToModule } from "../permission/userPermission";
import { authCookieOptions } from './cookieOptions';

export async function me(
    me: MeResponse,
) {
    const cookieStore = await cookies();

    const permissions = mapMePermissionToModule(me.authorities)
    const permissionsToken = await sign(permissions);
    const meToSign: MeCookie = {
        userName: me.userName ?? '',
        userId: me.userId,
        sessionId: me.sessionId,
        sessionActive: me.sessionActive,
        expires: new Date(Date.now() + me.expiresInSeconds * 1000).toISOString(),
    }
    const meToken = await sign(meToSign);
    cookieStore.set('Me', meToken, authCookieOptions(true));
    cookieStore.set('Permissions', permissionsToken, authCookieOptions(true));
}
