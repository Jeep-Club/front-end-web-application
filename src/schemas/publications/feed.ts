import { z } from "zod";

// Preserve the wire value: Date/toISOString would discard sub-millisecond precision.
export const publicationInstantSchema = z.iso.datetime({ error: 'Use um instante UTC válido, como 2026-10-29T12:00:00Z.' }).regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/, 'Use um instante UTC, como 2026-10-29T12:00:00Z.');
export const feedTypeSchema = z.enum(["NOTICE", "EVENT", "SERVICE"]);
export const publicationFeedFiltersSchema = z.object({
    type: feedTypeSchema.optional(),
    publishedFrom: publicationInstantSchema.optional(),
    publishedTo: publicationInstantSchema.optional(),
}).superRefine(({ publishedFrom, publishedTo }, ctx) => {
    if (!publishedFrom || !publishedTo) return;
    const sortable = (value: string) => value.slice(0, 19) + (value.split('.')[1]?.slice(0, -1) ?? '').padEnd(9, '0');
    if (sortable(publishedFrom) > sortable(publishedTo)) ctx.addIssue({ code: 'custom', path: ['publishedTo'], message: 'O fim deve ser igual ou posterior ao início.' });
});
export const publicationFeedParamsSchema = publicationFeedFiltersSchema.safeExtend({
    page: z.number().int().nonnegative(), size: z.number().int().min(1).max(50),
});
export type PublicationFeedParams = z.infer<typeof publicationFeedParamsSchema>;
export type PublicationFeedFilters = z.infer<typeof publicationFeedFiltersSchema>;

export const publicationImageSchema = z.object({ storageKey: z.string(), position: z.number().int(), primary: z.boolean() });
const common = z.object({
    id: z.number().int().positive(), authorUserId: z.number(), title: z.string(), content: z.string(),
    primaryImage: publicationImageSchema.nullable(), publishedAt: publicationInstantSchema,
    likeCount: z.number().nonnegative(), commentCount: z.number().nonnegative(), likedByMe: z.boolean(),
});
const notice = common.extend({ type: z.literal("NOTICE"), details: z.object({}) });
const eventParticipant = z.object({
    id: z.number().optional(), userId: z.number().optional(), name: z.string(),
    profilePhotoStorageKey: z.string().nullish(), profilePhotoUrl: z.string().nullish(),
    photoStorageKey: z.string().nullish(), photoUrl: z.string().nullish(),
});
const event = common.extend({ type: z.literal("EVENT"), details: z.object({
    startsAt: publicationInstantSchema, endsAt: publicationInstantSchema.nullable(), status: z.enum(["OPEN", "IN_PROGRESS", "FINISHED", "CANCELLED"]),
    // Legacy optional extensions; the unified reading contract does not supply these.
    registrationCount: z.number().int().nonnegative().optional(),
    participants: z.array(eventParticipant).optional(),
}) });
const service = common.extend({ type: z.literal("SERVICE"), details: z.object({ amount: z.number(), contactPhone: z.string() }) });
export const publicationFeedItemSchema = z.discriminatedUnion("type", [notice, event, service]);
const gallery = { images: z.array(publicationImageSchema) };
export const publicationFeedDetailSchema = z.discriminatedUnion("type", [
    notice.omit({ primaryImage: true }).extend(gallery), event.omit({ primaryImage: true }).extend(gallery), service.omit({ primaryImage: true }).extend(gallery),
]);
export const publicationCommentSchema = z.object({
    id: z.number(), publicationId: z.number(), authorUserId: z.number(), text: z.string(),
    authorName: z.string().nullish(),
    authorPhotoStorageKey: z.string().nullish(),
    authorProfilePhotoStorageKey: z.string().nullish(),
    authorPhotoUrl: z.string().nullish(),
    authorProfilePhotoUrl: z.string().nullish(),
    images: z.array(z.object({ storageKey: z.string(), position: z.number() })), createdAt: z.string(),
});
export type PublicationFeedItem = z.infer<typeof publicationFeedItemSchema>;
export type PublicationFeedDetail = z.infer<typeof publicationFeedDetailSchema>;
