import {
    Car,
    KeyRound,
    Users,
    WalletCards,
    type LucideIcon,
} from "lucide-react";

/**
 * Permissão única e obrigatória que decide se o módulo existe pro
 * usuário — card no painel + acesso à rota. De propósito coisa binária (tem a
 * permissão de leitura, ou não tem), não uma combinação de alternativas.
 *
 * As demais permissões daquele módulo (criar, editar, excluir...) só
 * fazem sentido DEPOIS que essa aqui já liberou o acesso — elas
 * controlam o que aparece DENTRO da tela, não se a tela existe.
 */
export interface AdminVisibilityPermission {
    module: string;
    action: string;
}

export interface AdminModuleConfig {
    key: string;
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    visibilityPermission: AdminVisibilityPermission;
}

export const adminModules: AdminModuleConfig[] = [
    {
        key: "users",
        title: "Gestão de usuários",
        description:
            "Visualize, ative e desative usuários do sistema.",
        href: "/admin/users",
        icon: Users,
        visibilityPermission: {
            module: "AUTHENTICATION",
            action: "USER_READ",
        },
    },
    {
        key: "roles-permissions",
        title: "Roles e permissões",
        description:
            "Defina o que cada administrador pode acessar e fazer.",
        href: "/admin/roles-permissoes",
        icon: KeyRound,
        visibilityPermission: {
            module: "AUTHORIZATION",
            action: "ROLE_READ",
        },
    },
    {
        key: "financial-management",
        title: "Gestão financeira",
        description:
            "Acompanhe mensalidades, faturas e a saúde financeira do clube.",
        href: "/admin/gestao-financeira",
        icon: WalletCards,
        visibilityPermission: {
            module: "BILLING",
            action: "CHARGE_DEFINITION_READ",
        },
    },
    {
        key: "vehicles",
        title: "Administração de veículos",
        description:
            "Visualize, cadastre e gerencie os veículos de todos os membros.",
        href: "/admin/veiculos",
        icon: Car,
        visibilityPermission: {
            module: "VEHICLES",
            action: "VEHICLE_READ",
        },
    },
];

export function canAccessAdminModule(
    userPermissions: PermissionModule[],
    adminModule: AdminModuleConfig,
): boolean {
    const { module, action } = adminModule.visibilityPermission;

    const userModule = userPermissions.find(
        (permissionModule) => permissionModule.module === module,
    );

    if (!userModule) {
        return false;
    }

    return userModule.actions.includes(action);
}

// retorna somente os módulos que devem aparecer
// no painel administrativo.

export function getAvailableAdminModules(
    userPermissions: PermissionModule[],
): AdminModuleConfig[] {
    return adminModules.filter((adminModule) =>
        canAccessAdminModule(
            userPermissions,
            adminModule,
        ),
    );
}


// vrifica se o usuário possui acesso a pelo menos
// * um módulo administrativo.

export function hasAnyAdminAccess(
    userPermissions: PermissionModule[],
): boolean {
    return (
        getAvailableAdminModules(userPermissions).length > 0
    );
}
