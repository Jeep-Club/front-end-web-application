interface UpdateToolRequest {
    name?: string;
    description?: string;
}

type UpdateToolFormData = UpdateToolRequest & ToolPhotoFormFields;

type UpdateToolResponse = ToolDetail;
