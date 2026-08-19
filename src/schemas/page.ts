import { z } from "zod";


export const pageSortSchema = z.object({
    sorted: z.boolean(),
    unsorted: z.boolean(),
    empty: z.boolean(),
}) satisfies z.ZodType<PageSort>;

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
        sort: pageSortSchema,
    }) satisfies z.ZodType<PageResponse<z.infer<T>>>;