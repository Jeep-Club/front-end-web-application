"use server";
import { ActionError } from "@/utils/http/ActionError";

import { pageResponseSchema } from "@/schemas/page";
import { feedTypeSchema,publicationCommentSchema,publicationFeedDetailSchema,publicationFeedItemSchema } from "@/schemas/publications/feed";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { parsePublicationPagination } from "@/utils/publications/pagination";
import { z } from "zod";

async function requirePermission(action: string) {
    if (!await haveActionPermission("PUBLICATIONS", action)) throw new ActionError("Você não tem permissão para realizar esta ação.");
}
const idSchema = z.number().int().positive();

export async function listPublicationFeedAction(input: { page: number; size: number; type?: "NOTICE" | "EVENT" | "SERVICE" }) {
    await requirePermission("FEED_READ");
    const pagination = parsePublicationPagination(new URLSearchParams({ page: String(input.page), size: String(input.size) }));
    const params = new URLSearchParams({ page: String(pagination.pageIndex), size: String(pagination.pageSize) });
    if (input.type) params.set("type", feedTypeSchema.parse(input.type));
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

export async function createPublicationCommentAction(input: {
    id: number;
    text?: string;
    images: { storageKey: string; position: number }[];
}) {
    const data = z.object({
        id: idSchema,
        text: z.string().trim().max(10_000).optional(),
        images: z.array(z.object({ storageKey: z.string().trim().min(1), position: z.number().int().nonnegative() })).max(10),
    }).superRefine((value, context) => {
        const text = value.text?.trim() ?? "";
        if (!text && value.images.length === 0) {
            context.addIssue({ code: "custom", message: "Escreva um comentário ou anexe uma imagem." });
        }
        if (new Set(value.images.map(image => image.storageKey)).size !== value.images.length) {
            context.addIssue({ code: "custom", message: "As imagens do comentário precisam ser diferentes." });
        }
        if (value.images.some((image, index) => image.position !== index)) {
            context.addIssue({ code: "custom", message: "A ordem das imagens do comentário é inválida." });
        }
    }).parse(input);
    await requirePermission("COMMENT_CREATE");
    const result = await actionFetchWrapper({
        url: `publications/${data.id}/comments`,
        method: "POST",
        body: JSON.stringify({ text: data.text?.trim() || null, images: data.images }),
        schema: publicationCommentSchema,
    });
    return result.data;
}
