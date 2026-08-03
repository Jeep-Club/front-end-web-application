import {
    CalendarDays,
    KeyRound,
    Users,
    WalletCards,
    type LucideIcon,
} from "lucide-react";

export type AdminPermissionMatch = "any" | "all";

export interface AdminPermissionRule {
    module: string;
    actions: string[];

    /*
     * any:
     * basta possuir uma das ações.
     *
     * all:
     * precisa possuir todas as ações.
     */
    match?: AdminPermissionMatch;
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
        description:
            "Visualize, ative e desative usuários do sistema.",
        href: "/admin/users",
        icon: Users,
        permissionRules: [
            {
                module: "AUTHENTICATION",
                match: "any",
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
        description:
            "Gerencie cobranças, pagamentos e movimentações do clube.",
        href: "/admin/finance",
        icon: WalletCards,
        permissionRules: [
            {
                module: "BILLING",
                match: "any",
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
        description:
            "Crie, edite e acompanhe os eventos do Jeep Club.",
        href: "/admin/events",
        icon: CalendarDays,
        permissionRules: [
            {
                module: "EVENTS",
                match: "any",

                /*
                 * Permissões temporárias.
                 * Depois podemos substituir pelos nomes oficiais
                 * enviados pelo backend.
                 */
                actions: [
                    "READ",
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
    key: "roles-permissions",
    title: "Roles e permissões",
    description:
        "Defina o que cada administrador pode acessar e fazer.",
    href: "/admin/roles-permissoes",
    icon: KeyRound,
    permissionRules: [
        {
            module: "AUTHORIZATION",
            match: "all",
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
},
]

/**
 * Verifica uma regra individual de permissão.
 */
function hasPermissionRule(
    userPermissions: PermissionModule[],
    rule: AdminPermissionRule,
): boolean {
    const userModule = userPermissions.find(
        (permissionModule) =>
            permissionModule.module === rule.module,
    );

    if (!userModule) {
        return false;
    }

    /*
     * O padrão é "any".
     *
     * Isso significa que módulos administrativos comuns aparecem
     * quando o usuário possui pelo menos uma ação daquele módulo.
     */
    const matchMode = rule.match ?? "any";

    if (matchMode === "all") {
        return rule.actions.every((action) =>
            userModule.actions.includes(action),
        );
    }

    return rule.actions.some((action) =>
        userModule.actions.includes(action),
    );
}

/**
 * Verifica se o usuário pode acessar determinado módulo
 * administrativo.
 */
export function canAccessAdminModule(
    userPermissions: PermissionModule[],
    adminModule: AdminModuleConfig,
): boolean {
    /*
     * permissionRules utiliza OR entre módulos.
     *
     * Dentro de cada regra, o campo match define se:
     * - qualquer ação é suficiente;
     * - ou todas as ações são obrigatórias.
     */
    return adminModule.permissionRules.some((rule) =>
        hasPermissionRule(userPermissions, rule),
    );
}

/**
 * Retorna somente os módulos que devem aparecer
 * no painel administrativo.
 */
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

/**
 * Verifica se o usuário possui acesso a pelo menos
 * um módulo administrativo.
 */
export function hasAnyAdminAccess(
    userPermissions: PermissionModule[],
): boolean {
    return (
        getAvailableAdminModules(userPermissions).length > 0
    );
}