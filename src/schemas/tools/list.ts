import { z } from "zod";

export const toolStatusSchema: z.ZodType<ToolStatus> = z.enum(["ACTIVE", "INACTIVE", "DELETED"]);

export const toolListItemSchema: z.ZodType<ToolListItem> = z.object({
    id: z.number(),
    name: z.string(),
    status: toolStatusSchema,
});

export const listToolsResponseSchema: z.ZodType<ListToolsResponse> = z.object({
    content: z.array(toolListItemSchema),
    totalElements: z.number(),
    totalPages: z.number(),
    number: z.number(),
    size: z.number(),
    first: z.boolean(),
    last: z.boolean(),
    numberOfElements: z.number(),
    empty: z.boolean(),
});
