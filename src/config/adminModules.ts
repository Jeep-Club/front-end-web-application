import { publicationManagementAccessActions } from "@/config/publicationManagement";
import {
    Newspaper,
    Car,
    KeyRound,
    UserRoundCheck,
    Users,
    WalletCards,
    ChartNoAxesCombined,
    Receipt,
    Wrench,
    HeartPulse,
    type LucideIcon,
} from "lucide-react";

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
    alternativeVisibilityPermissions?: AdminVisibilityPermission[];
}

export const adminModules: AdminModuleConfig[] = [
    {
        key: "medical-profiles",
        title: "Gestão de dados médicos",
        description: "Consulte e gerencie os dados médicos de usuários e dependentes.",
        href: "/admin/dados-medicos",
        icon: HeartPulse,
        visibilityPermission: { module: "HEALTH", action: "MEDICAL_PROFILE_READ" },
    },
    {
        key: "publication-management",
        title: "Gestão de publicações",
        description: "Gerencie eventos, avisos e anúncios de serviços do clube.",
        href: "/admin/publications",
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
        title: "Gestão de cargos e permissões",
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
        key: "financial-overview",
        title: "Visão geral financeira",
        description: "Acompanhe os indicadores do clube e configure a cobrança de referência da associação.",
        href: "/admin/gestao-financeira",
        icon: ChartNoAxesCombined,
        visibilityPermission: {
            module: "BILLING",
            action: "CHARGE_DEFINITION_READ",
            alternativeActions: ["CHARGE_CYCLE_READ", "MEMBER_CHARGE_READ", "PAYMENT_READ", "REFUND_READ"],
        },
        alternativeVisibilityPermissions: [{ module: "MEMBERSHIP", action: "BILLING_CONFIGURATION_READ" }],
    },
    {
        key: "financial-charges",
        title: "Configuração de cobranças",
        description: "Defina valores e regras, gerencie atribuições e acompanhe os ciclos de cobrança.",
        href: "/admin/gestao-financeira/cobrancas",
        icon: Receipt,
        visibilityPermission: { module: "BILLING", action: "CHARGE_DEFINITION_READ", alternativeActions: ["CHARGE_CYCLE_READ"] },
    },
    {
        key: "financial-movements",
        title: "Movimentações financeiras",
        description: "Consulte cobranças dos associados, pagamentos, análises e reembolsos.",
        href: "/admin/gestao-financeira/movimentacoes",
        icon: WalletCards,
        visibilityPermission: { module: "BILLING", action: "MEMBER_CHARGE_READ", alternativeActions: ["PAYMENT_READ", "REFUND_READ"] },
    },
    {
        key: "vehicles",
        title: "Gestão de veículos",
        description:
            "Visualize, cadastre e gerencie os veículos de todos os membros.",
        href: "/admin/veiculos",
        icon: Car,
        visibilityPermission: {
            module: "VEHICLES",
            action: "VEHICLE_READ",
        },
    },
    {
        key: "tools",
        title: "Gestão de ferramentas",
        description:
            "Visualize, cadastre e gerencie as ferramentas de todos os associados.",
        href: "/admin/ferramentas",
        icon: Wrench,
        visibilityPermission: {
            module: "TOOLS",
            action: "TOOL_READ",
        },
    },
    {
        key: "dependents",
        title: "Gestão de dependentes",
        description:
            "Visualize, ative, desative, arquive e exporte os dependentes dos associados.",
        href: "/admin/dependentes",
        icon: Users,
        visibilityPermission: {
            module: "DEPENDENTS",
            action: "DEPENDENT_READ",
        },
    },
];

export function canAccessAdminModule(
    userPermissions: PermissionModule[],
    adminModule: AdminModuleConfig,
): boolean {
    return [adminModule.visibilityPermission, ...(adminModule.alternativeVisibilityPermissions ?? [])].some(({ module, action, alternativeActions = [] }) =>
        userPermissions.some(permission => permission.module === module && [action, ...alternativeActions].some(candidate => permission.actions.includes(candidate))),
    );
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
