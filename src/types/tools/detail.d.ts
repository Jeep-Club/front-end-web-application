interface ToolDetail {
    id: number;
    name: string;
    description: string | null;
    status: ToolStatus;
    userId: number;
}