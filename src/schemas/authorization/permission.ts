import { z } from "zod";

export const permissionResponseSchema: z.ZodType<PermissionResponse> = z.object({
    id: z.number(),
    code: z.string(),
    description: z.string(),
    module: z.string(),
});

export const permissionListResponseSchema = z.array(permissionResponseSchema);
