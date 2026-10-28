import { publicationManagementAccessActions } from "@/config/publicationManagement";
import {
    Newspaper,
    Car,
    KeyRound,
    UserRoundCheck,
    Users,
    WalletCards,
    type LucideIcon,
} from "lucide-react";
import { paymentPermissions } from "@/config/paymentPermissions";

/**
 * Permissão de leitura que decide se o módulo existe para o usuário.
 * Módulos com várias áreas podem oferecer ações alternativas de leitura.
 *
 * As demais permissões daquele módulo (criar, editar, excluir...) só
 * fazem sentido DEPOIS que essa aqui já liberou o acesso — elas
 * controlam o que aparece DENTRO da tela, não se a tela existe.
 */
export interface AdminVisibilityPermission {
    module: string;
    action: string;
    alternativeActions?: string[];
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
        key: "payments",
        title: "Análise de pagamentos",
        description: "Consulte comprovantes e confirme ou rejeite pagamentos.",
        href: "/admin/pagamentos",
        icon: WalletCards,
        visibilityPermission: { module: paymentPermissions.module, action: paymentPermissions.read },
    },
    {
        key: "publication-management",
        title: "Gestão de publicações",
        description: "Gerencie eventos, avisos e anúncios de serviços do clube.",
        href: "/admin/gestao-publicacoes",
        icon: Newspaper,
        visibilityPermission: {
            module: "PUBLICATIONS",
            action: publicationManagementAccessActions[0],
            alternativeActions: publicationManagementAccessActions.slice(1),
        },
    },
    {
        key: "users",
        title: "Gestão de usuários",
        description:
            "Visualize, ative e desative usuários do sistema.",
        href: "/admin/users",
        icon: Users,
        visibilityPermission: {
            module: "IDENTITY",
            action: "USER_READ",
        },
    },
    {
        key: "membership-applications",
        title: "Solicitações de associação",
        description: "Analise novos pedidos de adesão ao clube.",
        href: "/admin/users?tab=applications",
        icon: UserRoundCheck,
        visibilityPermission: {
            module: "MEMBERSHIP",
            action: "MEMBERSHIP_REQUEST_READ",
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
            alternativeActions: ["CHARGE_CYCLE_READ", "MEMBER_CHARGE_READ", "PAYMENT_READ", "REFUND_READ"],
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

    return [action, ...(adminModule.visibilityPermission.alternativeActions ?? [])].some((candidate) => userModule.actions.includes(candidate));
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
