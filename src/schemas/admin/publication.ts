import { z } from "zod";

const optionalUrl = z.union([z.url("Informe uma URL válida."), z.literal("")])
    .optional().transform((value) => value || undefined);
const dateTime = z.iso.datetime({ offset: true }).or(z.iso.datetime({ local: true }));

export const publicationMediaInputSchema = z.object({
    id: z.bigint().positive().optional(),
    type: z.enum(["image", "video"]),
    url: z.url("Informe uma URL válida para a mídia."),
    thumbnailUrl: optionalUrl,
    alt: z.string().trim().optional().transform((value) => value || undefined),
    caption: z.string().trim().optional().transform((value) => value || undefined),
});

export const publicationMediaSchema = publicationMediaInputSchema.extend({ id: z.bigint().positive() });

const inputBase = z.object({
    title: z.string().trim().min(3, "O título deve ter pelo menos 3 caracteres.").max(150),
    summary: z.string().trim().max(300).optional().transform((value) => value || undefined),
    content: z.string().trim().min(1, "Informe o conteúdo."),
    thumbnailUrl: optionalUrl,
    status: z.enum(["draft", "published", "archived"]),
    media: z.array(publicationMediaInputSchema),
});

const eventInput = inputBase.extend({
    type: z.literal("event"), startAt: dateTime, endAt: dateTime,
    addressId: z.bigint().positive("Informe um ID de endereço válido."),
    maxParticipants: z.number().int().positive().nullable(), requiresConfirmation: z.boolean(),
}).superRefine((value, context) => {
    if (new Date(value.endAt).getTime() <= new Date(value.startAt).getTime()) {
        context.addIssue({ code: "custom", path: ["endAt"], message: "O término deve ser posterior ao início." });
    }
});
const noticeInput = inputBase.extend({
    type: z.literal("notice"), expiresAt: dateTime.nullable(), noticePriority: z.enum(["low", "medium", "high"]),
});
const serviceInput = inputBase.extend({
    type: z.literal("service"), serviceCategory: z.enum(["benefit", "help", "general"]),
});

export const createPublicationSchema = z.discriminatedUnion("type", [eventInput, noticeInput, serviceInput]);
export const updatePublicationSchema = createPublicationSchema;

const entityBase = z.object({
    id: z.bigint().positive(), title: z.string(), summary: z.string().optional(), content: z.string(),
    thumbnailUrl: z.string().optional(), media: z.array(publicationMediaSchema),
    status: z.enum(["draft", "published", "archived"]), publishedAt: z.string().optional(),
    createdAt: z.string(), updatedAt: z.string(),
});
export const publicationSchema = z.discriminatedUnion("type", [
    entityBase.extend({ type: z.literal("event"), startAt: z.string(), endAt: z.string(), addressId: z.bigint(), maxParticipants: z.number().nullable(), requiresConfirmation: z.boolean() }),
    entityBase.extend({ type: z.literal("notice"), expiresAt: z.string().nullable(), noticePriority: z.enum(["low", "medium", "high"]) }),
    entityBase.extend({ type: z.literal("service"), serviceCategory: z.enum(["benefit", "help", "general"]) }),
]);

export const publicationFilterSchema = z.object({
    q: z.string().trim().optional(), title: z.string().trim().optional(),
    type: z.enum(["event", "notice", "service"]).optional(), status: z.enum(["draft", "published", "archived"]).optional(),
    noticePriority: z.enum(["low", "medium", "high"]).optional(), serviceCategory: z.enum(["benefit", "help", "general"]).optional(),
    createdFrom: z.iso.date().optional(), createdTo: z.iso.date().optional(), publishedFrom: z.iso.date().optional(), publishedTo: z.iso.date().optional(),
    page: z.coerce.number().int().min(0).default(0), size: z.coerce.number().int().min(1).max(100).default(10), sort: z.string().optional(),
});

export const publicationPageResponseSchema = z.object({
    content: z.array(publicationSchema), totalElements: z.number(), totalPages: z.number(), number: z.number(), size: z.number(),
    first: z.boolean(), last: z.boolean(), numberOfElements: z.number(), empty: z.boolean(),
    sort: z.object({ sorted: z.boolean(), unsorted: z.boolean(), empty: z.boolean() }),
});

