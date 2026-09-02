import { z } from "zod";
import { toolStatusSchema } from "@/schemas/tools/list";

const pageSortSchema: z.ZodType<PageSort> = z.object({
    sorted: z.boolean(),
    unsorted: z.boolean(),
    empty: z.boolean(),
});

export const adminToolListItemSchema: z.ZodType<AdminToolListItem> = z.object({
    id: z.number(),
    name: z.string(),
    status: toolStatusSchema,
    userId: z.number(),
});

export const listAdminToolsResponseSchema: z.ZodType<ListAdminToolsResponse> = z.object({
    content: z.array(adminToolListItemSchema),
    totalElements: z.number(),
    totalPages: z.number(),
    number: z.number(),
    size: z.number(),
    first: z.boolean(),
    last: z.boolean(),
    numberOfElements: z.number(),
    empty: z.boolean(),
    sort: pageSortSchema,
});