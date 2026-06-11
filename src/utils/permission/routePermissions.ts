import { permissionModuleSchema } from "@/schemas/auth/permission/permissionModule";
import { verifyWithSchema } from "@/services/token/verify";

export const routePermissions: Record<string, PermissionModule[]> = {
    "/register": [{ module: "AUTHENTICATION", actions: ['USER_CREATE'] }],
    "/home": [],
    "/admin/medical-profile": [{ module: "HEALTH", actions: ['MEDICAL_PROFILE_READ'] }],
};


export const haveRoutePermissions = async ({ pathname, permissionsToken, onCatch }: HaveRoutePermissionsProps): Promise<boolean> => {
    const permissions = await verifyWithSchema<PermissionModule[]>(permissionsToken, permissionModuleSchema.array())
        .catch(() => {
            throw onCatch();
        });

    if (routePermissions[pathname]) {
        const requiredPermissions = routePermissions[pathname];
        const hasRequiredPermissions = requiredPermissions.every(module => {
            const userModule = permissions.find(userModule => userModule.module === module.module);
            if (!userModule) {
                return false;
            }
            const hasRequiredActions = module.actions.every(action => userModule.actions.includes(action));
            if (!hasRequiredActions) {
                return false;
            }
            return true;
        });
        return hasRequiredPermissions;
    }
    return false;
}

export const simpleHaveRoutePermissions = async (pathname: string) => {
    const { cookies } = await import("next/headers");
    const { redirect, notFound } = await import("next/navigation");
    const cookieStore = await cookies();
    const permissionsToken = cookieStore.get("Permissions")?.value || '';
    const havePermissions = await haveRoutePermissions({
        pathname,
        permissionsToken,
        onCatch: () => {redirect('api/auth/logout');}
    });
    if (!havePermissions) {
        notFound();
    }
}