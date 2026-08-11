type ToolStatus = "ACTIVE" | "INACTIVE" | "DELETED";

interface ToolListItem {
    id: number;
    name: string;
    status: ToolStatus;
}

type ListToolsResponse = PageResponse<ToolListItem>;