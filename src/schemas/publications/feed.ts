import { z } from "zod";

export const publicationImageSchema = z.object({ storageKey: z.string(), position: z.number().int(), primary: z.boolean() });
const common = z.object({
    id: z.number().int().positive(), authorUserId: z.number(), title: z.string(), content: z.string(),
    primaryImage: publicationImageSchema.nullable(), publishedAt: z.string(),
    likeCount: z.number().nonnegative(), commentCount: z.number().nonnegative(), likedByMe: z.boolean(),
});
const notice = common.extend({ type: z.literal("NOTICE"), details: z.object({}) });
const event = common.extend({ type: z.literal("EVENT"), details: z.object({ startsAt: z.string(), endsAt: z.string().nullable(), status: z.enum(["OPEN", "IN_PROGRESS", "FINISHED", "CANCELLED"]) }) });
const service = common.extend({ type: z.literal("SERVICE"), details: z.object({ amount: z.number(), contactPhone: z.string() }) });
export const publicationFeedItemSchema = z.discriminatedUnion("type", [notice, event, service]);
const gallery = { images: z.array(publicationImageSchema) };
export const publicationFeedDetailSchema = z.discriminatedUnion("type", [
    notice.omit({ primaryImage: true }).extend(gallery), event.omit({ primaryImage: true }).extend(gallery), service.omit({ primaryImage: true }).extend(gallery),
]);
export const publicationCommentSchema = z.object({
    id: z.number(), publicationId: z.number(), authorUserId: z.number(), text: z.string(),
    images: z.array(z.object({ storageKey: z.string(), position: z.number() })), createdAt: z.string(),
});
export type PublicationFeedItem = z.infer<typeof publicationFeedItemSchema>;
export type PublicationFeedDetail = z.infer<typeof publicationFeedDetailSchema>;
export const feedTypeSchema = z.enum(["NOTICE", "EVENT", "SERVICE"]);