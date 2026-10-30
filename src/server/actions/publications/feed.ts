"use server";
import { ActionError } from "@/utils/http/ActionError";

import { pageResponseSchema } from "@/schemas/page";
import { publicationFeedParamsSchema, type PublicationFeedParams,publicationCommentSchema,publicationFeedDetailSchema,publicationFeedItemSchema } from "@/schemas/publications/feed";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { z } from "zod";

async function requirePermission(action: string) {
    if (!await haveActionPermission("PUBLICATIONS", action)) throw new ActionError("Você não tem permissão para realizar esta ação.", { status: 403, code: 'ACCESS_DENIED' });
}
const idSchema = z.number().int().positive();

export async function listPublicationFeedAction(input: PublicationFeedParams) {
    await requirePermission("FEED_READ");
    const parsed = publicationFeedParamsSchema.safeParse(input);
    if (!parsed.success) throw new ActionError('Revise os filtros da publicação.', { status: 400, code: 'PUBLICATION_FEED_INVALID', errors: parsed.error.issues.map(issue => ({ field: issue.path.join('.'), code: issue.code, message: issue.message })) });
    const data = parsed.data;
    const params = new URLSearchParams({ page: String(data.page), size: String(data.size) });
    for (const key of ['type', 'publishedFrom', 'publishedTo'] as const) if (data[key]) params.set(key, data[key]);
    const result = await actionFetchWrapper({ url: `publications/feed?${params}`, method: "GET", cache: "no-store", schema: pageResponseSchema(publicationFeedItemSchema) });
    return result.data;
}

export async function getPublicationFeedDetailAction(id: number) {
    idSchema.parse(id);
    await requirePermission("PUBLICATION_READ");
    const result = await actionFetchWrapper({ url: `publications/${id}`, method: "GET", cache: "no-store", schema: publicationFeedDetailSchema });
    return result.data;
}

export async function setPublicationLikeAction(input: { id: number; like: boolean }) {
    const data = z.object({ id: idSchema, like: z.boolean() }).parse(input);
    await requirePermission("INTERACTION_LIKE");
    if (data.like) await actionFetchWrapper({ url: `publications/${data.id}/likes`, method: "POST", schema: z.object({ id: z.number(), publicationId: z.number(), createdAt: z.string() }) });
    else await actionFetchWrapper({ url: `publications/${data.id}/likes/me`, method: "DELETE", schema: z.literal("") });
}

export async function listPublicationCommentsAction(input: { id: number; page: number; size?: number }) {
    const data = z.object({ id: idSchema, page: z.number().int().nonnegative(), size: z.number().int().min(1).max(50).default(10) }).parse(input);
    await requirePermission("COMMENT_READ");
    const result = await actionFetchWrapper({ url: `publications/${data.id}/comments?page=${data.page}&size=${data.size}`, method: "GET", cache: "no-store", schema: pageResponseSchema(publicationCommentSchema) });
    return result.data;
}

export async function createPublicationCommentAction(input: { id: number; text: string }) {
    const data = z.object({ id: idSchema, text: z.string().trim().min(1, "Escreva seu comentário.") }).parse(input);
    await requirePermission("COMMENT_CREATE");
    const result = await actionFetchWrapper({ url: `publications/${data.id}/comments`, method: "POST", body: JSON.stringify({ text: data.text, images: [] }), schema: publicationCommentSchema });
    return result.data;
}
