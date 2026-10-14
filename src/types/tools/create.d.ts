interface CreateToolRequest {
    name: string;
    description?: string;
}

interface ToolPhotoFormFields { photo?: File[]; removePhoto?: boolean; }
type CreateToolFormData = CreateToolRequest & ToolPhotoFormFields;

type CreateToolResponse = ToolDetail;
