import { permissionModuleSchema } from "@/schemas/auth/permission/permissionModule";
import { verifyWithSchema } from "@/services/token/verify";

export const routePermissions: Record<string, PermissionModule[]> = {
    "/register": [
        {
            module: "AUTHENTICATION",
            actions: ["USER_CREATE"],
        },
    ],

    /*
     * Rotas autenticadas acessíveis para qualquer usuário logado.
     * O array vazio significa que nenhuma permissão específica é exigida.
     */
    "/feed": [],
    "/profile": [],

    /*
     * Administração de roles e permissões.
     *
     * Todas essas permissões são obrigatórias.
     * Dessa forma, apenas o administrador supremo consegue
     * acessar a página.
     */
    "/admin/roles-permissoes": [
        {
            module: "AUTHORIZATION",
            actions: [
                "ROLE_READ",
                "ROLE_CREATE",
                "ROLE_UPDATE",
                "ROLE_ENABLE",
                "ROLE_DISABLE",
                "ROLE_DELETE",

                "PERMISSION_READ",
                "PERMISSION_ASSIGN",
                "PERMISSION_REVOKE",

                "USER_ROLE_READ",
                "USER_ROLE_ASSIGN",
                "USER_ROLE_REVOKE",
            ],
        },
    ],

    /*
     * Administração de fichas médicas.
     *
     * Essa regra também protege rotas filhas, como:
     * /admin/medical-profile/1
     * /admin/medical-profile/1/edit
     */
    "/admin/medical-profile": [
        {
            module: "HEALTH",
            actions: ["MEDICAL_PROFILE_READ"],
        },
    ],

    /*
     * Administração de sócios e dependentes.
     *
     * Também protege rotas filhas, como:
     * /admin/socios/1
     */
    "/admin/socios": [
        {
            module: "DEPENDENTS",
            actions: ["DEPENDENT_READ"],
        },
    ],
};

/**
 * Transforma uma rota dinâmica declarada no objeto de permissões
 * em uma expressão regular.
 *
 * Exemplo:
 * /admin/users/[id]
 *
 * Torna-se:
 * /admin/users/qualquer-valor
 */
function createDynamicRouteRegex(route: string): RegExp {
    const dynamicRoutePattern = route.replace(
        /\[.*?\]/g,
        "[^/]+",
    );

    return new RegExp(`^${dynamicRoutePattern}$`);
}

/**
 * Procura a regra de permissões correspondente ao pathname atual.
 *
 * Ordem da busca:
 * 1. Correspondência exata;
 * 2. Rota dinâmica declarada;
 * 3. Rota filha de uma rota protegida;
 * 4. Bloqueio por padrão.
 */
function checkRoutePermissions(
    pathname: string,
): PermissionModule[] | false {
    /*
     * Exemplo:
     * pathname = /feed
     */
    if (routePermissions[pathname] !== undefined) {
        return routePermissions[pathname];
    }

    /*
     * Exemplo declarado:
     * /admin/users/[id]
     *
     * Pathname recebido:
     * /admin/users/10
     */
    const dynamicMatches = Object.keys(routePermissions).filter(
        (route) => {
            if (!route.includes("[")) {
                return false;
            }

            return createDynamicRouteRegex(route).test(pathname);
        },
    );

    if (dynamicMatches.length > 0) {
        /*
         * Havendo mais de uma correspondência, utiliza a rota
         * mais específica, ou seja, a string mais longa.
         */
        const bestDynamicMatch = dynamicMatches.sort(
            (firstRoute, secondRoute) =>
                secondRoute.length - firstRoute.length,
        )[0];

        return routePermissions[bestDynamicMatch];
    }

    /*
     * Protege automaticamente rotas filhas.
     *
     * Exemplo:
     * Regra: /admin/medical-profile
     * Rota:  /admin/medical-profile/15/edit
     */
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

    /*
     * Segurança por padrão:
     * rota autenticada não cadastrada é bloqueada.
     */
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

    const requiredPermissions =
        checkRoutePermissions(pathname);

    /*
     * A rota não está registrada.
     */
    if (requiredPermissions === false) {
        return false;
    }

    /*
     * Um array vazio representa uma rota autenticada que não exige
     * nenhuma permissão específica.
     *
     * Exemplo:
     * /feed
     * /profile
     */
    if (requiredPermissions.length === 0) {
        return true;
    }

    /*
     * Todos os módulos e todas as ações declaradas precisam
     * existir nas permissões do usuário.
     */
    return requiredPermissions.every((requiredModule) => {
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
    });
};

/**
 * Atalho para validar permissões diretamente em uma página
 * Server Component.
 */
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