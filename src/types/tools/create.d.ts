interface CreateToolRequest {
    name: string;
    description?: string;
}

type CreateToolFormData = CreateToolRequest;

type CreateToolResponse = ToolDetail;