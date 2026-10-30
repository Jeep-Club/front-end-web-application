"use server";
import { ActionError } from "@/utils/http/ActionError";

import { publicationDraftActions } from "@/config/publicationDraftActions";
import { draftMutationSchema,type DraftMutation } from "@/schemas/publications/draft";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { z } from "zod";
import { adminEventSchema, adminNoticeSchema } from "@/schemas/publications/admin";

export async function mutateDraftPublicationAction(input: DraftMutation) {
    const parsed = draftMutationSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message || "Confira os dados do rascunho.");
    const data = parsed.data;
    const config = publicationDraftActions[data.type];
    if (!await haveActionPermission("PUBLICATIONS", config[data.action])) throw new ActionError("Você não tem permissão para realizar esta ação.");
    if (await haveActionPermission("PUBLICATIONS", config.read)) {
        const current = await actionFetchWrapper<{ status?: string; publicationStatus?: string }>({
            url: `${config.path}/${data.id}`, method: "GET", cache: "no-store",
            schema: data.type === "EVENT" ? z.object({ publicationStatus: z.string() }) : z.object({ status: z.string() }),
        });
        if ((current.data.status ?? current.data.publicationStatus) !== "DRAFT") {
            throw new ActionError("Esta publicação não é mais um rascunho. Atualize a lista antes de continuar.", { status: 409 });
        }
    }
    if (data.action === "delete") {
        await actionFetchWrapper<unknown>({ url: `${config.path}/${data.id}`, method: "DELETE", schema: z.undefined() });
    } else if (data.action === "publish") {
        await actionFetchWrapper<{ id: number }>({
            url: `${config.path}/${data.id}/publish`, method: "POST",
            schema: data.type === "EVENT" ? adminEventSchema.extend({ publicationStatus: z.literal("PUBLISHED") }) : adminNoticeSchema.extend({ status: z.literal("PUBLISHED") }),
        });
    } else {
        await actionFetchWrapper<unknown>({ url: `${config.path}/${data.id}`, method: "PATCH", schema: data.type === "EVENT" ? adminEventSchema : adminNoticeSchema, body: JSON.stringify({ title: data.title, content: data.content }) });
    }
    return { id: data.id, type: data.type, action: data.action };
}
