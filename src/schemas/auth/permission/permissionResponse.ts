import z from 'zod';

export const permissionResponseSchema: z.ZodType<GetPermissionResponse> = z.array(
    z.object({
        id: z.number(),
        code: z.string(),
        description: z.string(),
        module: z.string(),
    })
);