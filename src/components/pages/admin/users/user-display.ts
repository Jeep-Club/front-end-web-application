
export const USER_STATUS_LABEL: Record<UserStatus, string> = {
    ACTIVE: "Ativo",
    LOCKED: "Bloqueado",
    DISABLED: "Desativado",
    PENDING_FIRST_ACCESS: "Primeiro acesso pendente",
    CHANGE_PASSWORD_REQUIRED: "Troca de senha pendente",
};

export const USER_STATUS_STYLE: Record<UserStatus, string> = {
    ACTIVE: "bg-j-green-100 text-j-green-700",
    LOCKED: "bg-j-yellow-100 text-j-yellow-700",
    DISABLED: "bg-j-gray-200 text-j-gray-600",
    PENDING_FIRST_ACCESS: "bg-j-blue-100/30 text-j-blue-800",
    CHANGE_PASSWORD_REQUIRED: "bg-j-red-100/40 text-j-red-700",
};

export const ROLE_STATUS_LABEL: Record<RoleStatus, string> = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    DELETED: "Excluído",
};
