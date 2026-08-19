import { permissionModuleSchema } from "@/schemas/auth/permission/permissionModule";
import { verifyWithSchema } from "@/services/token/verify";

/*
 * "all" (padrão): o usuário precisa satisfazer TODAS as entradas de
 * `permissions` pra acessar a rota.
 * "any": basta satisfazer UMA das entradas — usado em páginas compostas,
 * onde permissões diferentes dão acesso a partes diferentes da mesma
 * página (ex.: abas), mas qualquer uma delas já libera a página em si.
 */
interface RoutePermissionRule {
    match: "all" | "any";
    permissions: PermissionModule[];
}

type RoutePermissionsConfig = RoutePermissionRule | PermissionModule[];

export const routePermissions: Record<string, RoutePermissionsConfig> = {
    "/register": [
        {
            module: "AUTHENTICATION",
            actions: ["USER_CREATE"],
        },
    ],


    // rotas autenticadas acessíveis para qualquer usuário logado.
    // array vazio significa que nenhuma permissão específica é exigida.
    "/feed": [],
    "/profile": [],
    "/eventos": [],
    "/avisos": [],


    "/admin/roles-permissoes": {
        match: "any",
        permissions: [
            {
                module: "AUTHORIZATION",
                actions: ["ROLE_READ"],
            },
            {
                module: "AUTHORIZATION",
                actions: ["PERMISSION_READ"],
            },
            {
                module: "AUTHORIZATION",
                actions: ["USER_ROLE_READ"],
            },
        ],
    },

    "/admin/users": [
        {
            module: "AUTHENTICATION",
            actions: ["USER_READ"],
        },
    ],

    "/admin/medical-profile": [
        {
            module: "HEALTH",
            actions: ["MEDICAL_PROFILE_READ"],
        },
    ],

    "/admin/socios": [
        {
            module: "DEPENDENTS",
            actions: ["DEPENDENT_READ"],
        },
    ],

    "/admin/gestao-financeira": [
        {
            module: "FINANCE",
            actions: ["FINANCE_READ"],
        },
    ],
};

function normalizeRule(config: RoutePermissionsConfig): RoutePermissionRule {
    if (Array.isArray(config)) {
        return { match: "all", permissions: config };
    }

    return config;
}

function createDynamicRouteRegex(route: string): RegExp {
    const dynamicRoutePattern = route.replace(
        /\[.*?\]/g,
        "[^/]+",
    );

    return new RegExp(`^${dynamicRoutePattern}$`);
}

function checkRoutePermissions(
    pathname: string,
): RoutePermissionsConfig | false {

    if (routePermissions[pathname] !== undefined) {
        return routePermissions[pathname];
    }


    const dynamicMatches = Object.keys(routePermissions).filter(
        (route) => {
            if (!route.includes("[")) {
                return false;
            }

            return createDynamicRouteRegex(route).test(pathname);
        },
    );

    if (dynamicMatches.length > 0) {

        const bestDynamicMatch = dynamicMatches.sort(
            (firstRoute, secondRoute) =>
                secondRoute.length - firstRoute.length,
        )[0];

        return routePermissions[bestDynamicMatch];
    }


    const parentMatches = Object.keys(routePermissions).filter(
        (route) => pathname.startsWith(`${route}/`),
    );

    if (parentMatches.length > 0) {
        const bestParentMatch = parentMatches.sort(
            (firstRoute, secondRoute) =>
                secondRoute.length - firstRoute.length,
        )[0];

        return routePermissions[bestParentMatch];
    }


    return false;
}

export const haveRoutePermissions = async ({
    pathname,
    permissionsToken,
    onCatch,
}: HaveRoutePermissionsProps): Promise<boolean> => {
    const permissions =
        await verifyWithSchema<PermissionModule[]>(
            permissionsToken,
            permissionModuleSchema.array(),
        ).catch(() => {
            throw onCatch();
        });

    const requiredConfig =
        checkRoutePermissions(pathname);


    if (requiredConfig === false) {
        return false;
    }

    const { match, permissions: requiredPermissions } =
        normalizeRule(requiredConfig);

    if (requiredPermissions.length === 0) {
        return true;
    }

    const satisfies = (requiredModule: PermissionModule) => {
        const userModule = permissions.find(
            (permissionModule) =>
                permissionModule.module ===
                requiredModule.module,
        );

        if (!userModule) {
            return false;
        }

        return requiredModule.actions.every((requiredAction) =>
            userModule.actions.includes(requiredAction),
        );
    };

    return match === "any"
        ? requiredPermissions.some(satisfies)
        : requiredPermissions.every(satisfies);
};

export const simpleHaveRoutePermissions = async (
    pathname: string,
) => {
    const { cookies } = await import("next/headers");
    const { redirect, notFound } =
        await import("next/navigation");

    const cookieStore = await cookies();

    const permissionsToken =
        cookieStore.get("Permissions")?.value ?? "";

    const havePermissions = await haveRoutePermissions({
        pathname,
        permissionsToken,
        onCatch: () => {
            redirect("/api/auth/logout");
        },
    });

    if (!havePermissions) {
        notFound();
    }
};
