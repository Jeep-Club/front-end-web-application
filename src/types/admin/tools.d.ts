type AdminToolStatusFilter = "ACTIVE" | "INACTIVE" | "ARCHIVED";

interface AdminToolListItem {
    id: number;
    name: string;
    status: ToolStatus;
    userId: number;
    photoStorageKey?: string | null;
}

type ListAdminToolsResponse = PageResponse<AdminToolListItem>;

interface ListAdminToolsParams {
    page?: number;
    size?: number;
    name?: string;
    status?: AdminToolStatusFilter | "";
}

interface CreateAdminToolFormData extends CreateToolFormData {
    userId: number;
}
