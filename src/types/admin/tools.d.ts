interface AdminToolListItem {
    id: number;
    name: string;
    status: ToolStatus;
    userId: number;
}

interface AdminToolFilters {
    name?: string;
    status?: ToolStatus;
    page?: number;
    size?: number;
}

type ListAdminToolsResponse = PageResponse<AdminToolListItem>;