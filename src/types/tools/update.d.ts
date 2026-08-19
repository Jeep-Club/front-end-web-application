interface UpdateToolRequest {
    name?: string;
    description?: string;
}

type UpdateToolFormData = UpdateToolRequest;

type UpdateToolResponse = ToolDetail;