import { z } from "zod";
import { pageResponseSchema } from "@/schemas/page";

export const toolStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const toolListItemSchema: z.ZodType<ToolListItem> = z.object({
    id: z.number(),
    name: z.string(),
    status: toolStatusSchema,
});

export const listToolsResponseSchema: z.ZodType<ListToolsResponse> = pageResponseSchema(toolListItemSchema);
