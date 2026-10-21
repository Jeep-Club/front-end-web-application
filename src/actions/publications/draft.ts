"use server";

import { z } from "zod";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { publicationDraftActions } from "@/config/publicationDraftActions";
import { draftMutationSchema, type DraftMutation } from "@/schemas/publications/draft";

export async function mutateDraftPublicationAction(input: DraftMutation) {
    const parsed = draftMutationSchema.safeParse(input);
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Confira os dados do rascunho.");
    const data = parsed.data;
    const config = publicationDraftActions[data.type];
    if (!await haveActionPermission("PUBLICATIONS", config[data.action])) throw new Error("Você não tem permissão para realizar esta ação.");
    if (!await haveActionPermission("PUBLICATIONS", config.read)) throw new Error("Você não tem permissão para consultar este rascunho.");
    try {
        const current = await actionFetchWrapper<{ status?: string; publicationStatus?: string }>({
            url: `${config.path}/${data.id}`, method: "GET", cache: "no-store",
            schema: data.type === "EVENT" ? z.object({ publicationStatus: z.string() }) : z.object({ status: z.string() }),
        });
        if ((current.data.status ?? current.data.publicationStatus) !== "DRAFT") {
            throw new Error("Esta publicação não é mais um rascunho. Atualize a lista antes de continuar.");
        }
        if (data.action === "delete") {
            await actionFetchWrapper({ url: `${config.path}/${data.id}`, method: "DELETE", schema: z.literal("") });
        } else if (data.action === "publish") {
            await actionFetchWrapper<{ id: number }>({
                url: `${config.path}/${data.id}/publish`, method: "POST",
                schema: data.type === "EVENT" ? z.object({ id: z.number(), publicationStatus: z.literal("PUBLISHED") }) : z.object({ id: z.number(), status: z.literal("PUBLISHED") }),
            });
        } else {
            await actionFetchWrapper({ url: `${config.path}/${data.id}`, method: "PATCH", schema: z.object({ id: z.number() }), body: JSON.stringify({ title: data.title, content: data.content }) });
        }
        return { id: data.id, type: data.type, action: data.action };
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error(extractApiErrorMessage(error, "Não foi possível concluir a ação no rascunho."), { cause: error });
    }
}