import { permissionModuleSchema } from "@/schemas/auth/permission/permissionModule";
import { verifyWithSchema } from "@/services/token/verify";

export const haveActionPermission = async (module: string, action: string): Promise<boolean> => {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const permissionsToken = cookieStore.get("Permissions")?.value || '';
    const permissions = await verifyWithSchema<PermissionModule[]>(permissionsToken, permissionModuleSchema.array());

    return permissions.some((perm) => perm.module === module && perm.actions.includes(action));
}