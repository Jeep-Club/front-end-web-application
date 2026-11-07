import { signPermissions } from "@/services/token/permissions";
import { sign } from "@/services/token/sign";
import { verifyWithSchema } from "@/services/token/verify";
import { cookies } from "next/headers";
import { mapMePermissionToModule } from "../permission/userPermission";
import { authCookieOptions } from './cookieOptions';
import { meCookieSchema } from "@/schemas/auth/me/me";

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
    const permissionsToken = await signPermissions(permissions);
    const meToSign: MeCookie = {
        userName: identity.name,
        profilePhotoStorageKey: identity.profilePhotoStorageKey,
        userId: session.userId,
        sessionId: session.sessionId,
        sessionActive: session.sessionActive,
        expires: new Date(Date.now() + session.expiresInSeconds * 1000).toISOString(),
    }
    const meToken = await sign(meToSign);
    cookieStore.set('Me', meToken, authCookieOptions(true));
    cookieStore.set('Permissions', permissionsToken, authCookieOptions(true));
}

/** Keeps the signed session summary in sync after an existing session's first profile fetch. */
export async function cacheProfilePhotoStorageKey(storageKey: string | null) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("Me")?.value;
        if (!token) return;

        const currentUser = await verifyWithSchema<MeCookie>(token, meCookieSchema);
        if (currentUser.profilePhotoStorageKey === storageKey) return;

        const updatedToken = await sign({ ...currentUser, profilePhotoStorageKey: storageKey });
        cookieStore.set("Me", updatedToken, authCookieOptions(true));
    } catch {
        // Profile reads must succeed even if the optional avatar cache cannot be updated.
    }
}
