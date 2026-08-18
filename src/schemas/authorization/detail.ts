import { z } from "zod";

export const roleStatusSchema: z.ZodType<RoleStatus> = z.enum(["ACTIVE", "INACTIVE", "DELETED"]);

export const roleKindSchema: z.ZodType<RoleKind> = z.enum(["ROOT", "CUSTOM"]);

export const roleResponseSchema: z.ZodType<RoleResponse> = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    kind: roleKindSchema,
    status: roleStatusSchema,
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
    deletedAt: z.string().nullable(),
});
