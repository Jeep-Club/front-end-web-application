"use server";

import { z } from "zod";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { pageResponseSchema } from "@/schemas/page";
import { publicationFeedItemSchema, publicationFeedDetailSchema, publicationCommentSchema, feedTypeSchema } from "@/schemas/publications/feed";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { parsePublicationPagination } from "@/utils/publications/pagination";

async function requirePermission(action: string) {
    if (!await haveActionPermission("PUBLICATIONS", action)) throw new Error("Você não tem permissão para realizar esta ação.");
}
const idSchema = z.number().int().positive();

export async function listPublicationFeedAction(input: { page: number; size: number; type?: "NOTICE" | "EVENT" | "SERVICE" }) {
    await requirePermission("FEED_READ");
    const pagination = parsePublicationPagination(new URLSearchParams({ page: String(input.page), size: String(input.size) }));
    const params = new URLSearchParams({ page: String(pagination.pageIndex), size: String(pagination.pageSize) });
    if (input.type) params.set("type", feedTypeSchema.parse(input.type));
    try {
        const result = await actionFetchWrapper({ url: `publications/feed?${params}`, method: "GET", cache: "no-store", schema: pageResponseSchema(publicationFeedItemSchema) });
        return result.data;
    } catch (error) { throw new Error(extractApiErrorMessage(error, "Não foi possível carregar o feed."), { cause: error }); }
}

export async function getPublicationFeedDetailAction(id: number) {
    idSchema.parse(id);
    await requirePermission("PUBLICATION_READ");
    try {
        const result = await actionFetchWrapper({ url: `publications/${id}`, method: "GET", cache: "no-store", schema: publicationFeedDetailSchema });
        return result.data;
    } catch (error) { throw new Error(extractApiErrorMessage(error, "Não foi possível abrir a publicação."), { cause: error }); }
}

export async function setPublicationLikeAction(input: { id: number; like: boolean }) {
    const data = z.object({ id: idSchema, like: z.boolean() }).parse(input);
    await requirePermission("INTERACTION_LIKE");
    try {
        if (data.like) await actionFetchWrapper({ url: `publications/${data.id}/likes`, method: "POST", schema: z.object({ id: z.number(), publicationId: z.number(), createdAt: z.string() }) });
        else await actionFetchWrapper({ url: `publications/${data.id}/likes/me`, method: "DELETE", schema: z.literal("") });
    } catch (error) { throw new Error(extractApiErrorMessage(error, "Não foi possível atualizar sua curtida."), { cause: error }); }
}

export async function listPublicationCommentsAction(input: { id: number; page: number; size?: number }) {
    const data = z.object({ id: idSchema, page: z.number().int().nonnegative(), size: z.number().int().min(1).max(50).default(10) }).parse(input);
    await requirePermission("COMMENT_READ");
    try {
        const result = await actionFetchWrapper({ url: `publications/${data.id}/comments?page=${data.page}&size=${data.size}`, method: "GET", cache: "no-store", schema: pageResponseSchema(publicationCommentSchema) });
        return result.data;
    } catch (error) { throw new Error(extractApiErrorMessage(error, "Não foi possível carregar os comentários."), { cause: error }); }
}

export async function createPublicationCommentAction(input: { id: number; text: string }) {
    const data = z.object({ id: idSchema, text: z.string().trim().min(1, "Escreva seu comentário.") }).parse(input);
    await requirePermission("COMMENT_CREATE");
    try {
        const result = await actionFetchWrapper({ url: `publications/${data.id}/comments`, method: "POST", body: JSON.stringify({ text: data.text, images: [] }), schema: publicationCommentSchema });
        return result.data;
    } catch (error) { throw new Error(extractApiErrorMessage(error, "Não foi possível enviar seu comentário."), { cause: error }); }
}
