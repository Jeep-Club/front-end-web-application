import { permissionModuleSchema } from "@/schemas/auth/permission/permissionModule";
import { verifyWithSchema } from "@/services/token/verify";

export const routePermissions: Record<string, PermissionModule[]> = {
    "/register": [{ module: "AUTHENTICATION", actions: ['USER_CREATE'] }],
    "/home": [],
    "/admin/medical-profile": [{ module: "HEALTH", actions: ['MEDICAL_PROFILE_READ'] }],
};

const checkRoutePermissions = (pathname: string): PermissionModule[] | false => {
    // 1. Tenta correspondência exata primeiro (ex: /home, /register)
    if (routePermissions[pathname]) {
        return routePermissions[pathname];
    }

    // 2. Busca pelas rotas que cobrem o pathname com slug (ex: /admin/medical-profile/1)
    // O `${route}/` garante que "/admin/medical-profiles" não daria match com "/admin/medical-profile"
    const matchingRoutes = Object.keys(routePermissions).filter(route =>
        pathname.startsWith(`${route}/`)
    );

    // 3. Se encontrou alguma rota correspondente, pega a mais específica (a string mais longa)
    if (matchingRoutes.length > 0) {
        const bestMatch = matchingRoutes.sort((a, b) => b.length - a.length)[0];
        return routePermissions[bestMatch];
    }

    // Se a rota não está mapeada, bloqueia o acesso por padrão
    return false;
};

export const haveRoutePermissions = async ({ pathname, permissionsToken, onCatch }: HaveRoutePermissionsProps): Promise<boolean> => {
    const permissions = await verifyWithSchema<PermissionModule[]>(permissionsToken, permissionModuleSchema.array())
        .catch(() => {
            throw onCatch();
        });

    const requiredPermissions = checkRoutePermissions(pathname);
    if (requiredPermissions) {
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
        onCatch: () => { redirect('api/auth/logout'); }
    });
    if (!havePermissions) {
        notFound();
    }
}