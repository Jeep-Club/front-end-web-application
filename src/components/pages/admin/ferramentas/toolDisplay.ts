export const TOOL_STATUS_LABEL: Record<ToolStatus, string> = {
    ACTIVE: "Ativa",
    INACTIVE: "Inativa",
    ARCHIVED: "Arquivada",
};

export const TOOL_STATUS_BADGE_CLASS: Record<ToolStatus, string> = {
    ACTIVE: "bg-j-green-100 text-j-green-700",
    INACTIVE: "bg-j-gray-200 text-j-gray-600",
    ARCHIVED: "bg-amber-100 text-amber-700",
};

export const TOOL_STATUS_DOT_STYLE: Record<ToolStatus, string> = {
    ACTIVE: "bg-j-green-500",
    INACTIVE: "bg-j-gray-400",
    ARCHIVED: "bg-amber-500",
};

export const ADMIN_TOOL_STATUS_FILTER_OPTIONS: Array<{
    value: AdminToolStatusFilter | "";
    label: string;
}> = [
    { value: "", label: "Todos os status" },
    { value: "ACTIVE", label: "Ativas" },
    { value: "INACTIVE", label: "Inativas" },
    { value: "ARCHIVED", label: "Arquivadas" },
];
