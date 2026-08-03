import {
    CalendarDays,
    KeyRound,
    Users,
    WalletCards,
    type LucideIcon,
} from "lucide-react";

export interface AdminPermissionRule {
    module: string;
    actions: string[];
}

export interface AdminModuleConfig {
    key: string;
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    permissionRules: AdminPermissionRule[];
}

export const adminModules: AdminModuleConfig[] = [
    {
        key: "users",
        title: "Gestão de usuários",
        description: "Gerencie usuários dentro do sistema.",
        href: "/admin/users",
        icon: Users,
        permissionRules: [
            {
                module: "AUTHENTICATION",
                actions: [
                    "USER_READ",
                    "USER_ENABLE",
                    "USER_DISABLE",
                ],
            },
        ],
    },
    {
        key: "finance",
        title: "Gestão financeira",
        description: "Gerencie o fluxo financeiro do clube.",
        href: "/admin/finance",
        icon: WalletCards,
        permissionRules: [
            {
                module: "BILLING",
                actions: [
                    "CHARGE_DEFINITION_READ",
                    "CHARGE_DEFINITION_CREATE",
                    "CHARGE_DEFINITION_UPDATE",
                    "CHARGE_ASSIGNMENT_READ",
                    "CHARGE_ASSIGNMENT_CREATE",
                    "CHARGE_ASSIGNMENT_UPDATE",
                    "CHARGE_CYCLE_READ",
                    "CHARGE_CYCLE_GENERATE",
                    "MEMBER_CHARGE_READ",
                    "PAYMENT_READ",
                    "PAYMENT_CONFIRM",
                    "PAYMENT_REJECT",
                    "REFUND_READ",
                ],
            },
        ],
    },
    {
        key: "events",
        title: "Gestão de eventos",
        description: "Gerencie eventos dentro do sistema.",
        href: "/admin/events",
        icon: CalendarDays,
        permissionRules: [
            {
                // Temporário até confirmarmos os nomes oficiais no backend.
                module: "EVENTS",
                actions: [
                    "CREATE",
                    "UPDATE",
                    "DELETE",
                    "CANCEL",
                    "MANAGE",
                ],
            },
        ],
    },
    {
        key: "roles",
        title: "Gestão de roles",
        description: "Gerencie administradores e permissões.",
        href: "/admin/roles",
        icon: KeyRound,
        permissionRules: [
            {
                module: "AUTHORIZATION",
                actions: [
                    "ROLE_READ",
                    "ROLE_CREATE",
                    "ROLE_UPDATE",
                    "ROLE_ENABLE",
                    "ROLE_DISABLE",
                    "ROLE_DELETE",
                    "USER_ROLE_READ",
                    "USER_ROLE_ASSIGN",
                    "USER_ROLE_REVOKE",
                    "PERMISSION_READ",
                    "PERMISSION_ASSIGN",
                    "PERMISSION_REVOKE",
                ],
            },
        ],
    },
];

function hasPermissionRule(
    userPermissions: PermissionModule[],
    rule: AdminPermissionRule,
): boolean {
    const userModule = userPermissions.find(
        (permission) => permission.module === rule.module,
    );

    if (!userModule) {
        return false;
    }

    return rule.actions.some((action) =>
        userModule.actions.includes(action),
    );
}

export function canAccessAdminModule(
    userPermissions: PermissionModule[],
    adminModule: AdminModuleConfig,
): boolean {
    return adminModule.permissionRules.some((rule) =>
        hasPermissionRule(userPermissions, rule),
    );
}

export function getAvailableAdminModules(
    userPermissions: PermissionModule[],
): AdminModuleConfig[] {
    return adminModules.filter((adminModule) =>
        canAccessAdminModule(userPermissions, adminModule),
    );
}

export function hasAnyAdminAccess(
    userPermissions: PermissionModule[],
): boolean {
    return getAvailableAdminModules(userPermissions).length > 0;
}