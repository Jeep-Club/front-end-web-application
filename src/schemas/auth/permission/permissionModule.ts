import z from 'zod';

export const permissionModuleSchema: z.ZodType<PermissionModule> = z.object({
    actions: z.array(z.string()),
    module: z.string(),
});