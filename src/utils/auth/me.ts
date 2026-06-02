import { sign } from "@/services/token/sign";
import { cookies } from "next/headers";

export async function me(
    permissions: PermissionModule[],
) {
    const cookieStore = await cookies();
    const permissionsToken = await sign(permissions);
    cookieStore.set('Permissions', permissionsToken, { path: '/', httpOnly: true, secure: false, sameSite: "lax" });
}