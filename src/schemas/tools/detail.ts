import { z } from "zod";
import { toolStatusSchema } from "./list";

export const toolDetailResponseSchema: z.ZodType<ToolDetail> = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable().transform((value) => value ?? ''),
    status: toolStatusSchema,
    userId: z.number(),
    photoStorageKey: z.string().nullable().optional(),
});
