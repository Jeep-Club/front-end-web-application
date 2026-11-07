import { z } from "zod";


export const pageResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
    z.object({
        content: z.array(schema),
        totalElements: z.number(),
        totalPages: z.number(),
        number: z.number(),
        size: z.number(),
        first: z.boolean(),
        last: z.boolean(),
        numberOfElements: z.number(),
        empty: z.boolean(),
    }) satisfies z.ZodType<PageResponse<z.infer<T>>>;
