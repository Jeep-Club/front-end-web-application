type ToolStatus = "ACTIVE" | "INACTIVE" | "DELETED";

interface ToolListItem {
    id: number;
    name: string;
    status: ToolStatus;
    photoStorageKey?: string | null;
}

type ListToolsResponse = PageResponse<ToolListItem>;
