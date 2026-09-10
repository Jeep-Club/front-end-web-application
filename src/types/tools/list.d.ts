type ToolStatus = "ACTIVE" | "INACTIVE";

interface ToolListItem {
    id: number;
    name: string;
    status: ToolStatus;
}

type ListToolsResponse = PageResponse<ToolListItem>;