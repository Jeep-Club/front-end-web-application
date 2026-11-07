import { verifyPermissions } from "@/services/token/permissions";

export const haveActionPermission = async (module: string, action: string): Promise<boolean> => {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const permissionsToken = cookieStore.get("Permissions")?.value || '';
    const permissions = await verifyPermissions(permissionsToken);

    return permissions.some((perm) => perm.module === module && perm.actions.includes(action));
}