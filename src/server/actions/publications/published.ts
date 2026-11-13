"use server";
import { ActionError } from "@/utils/http/ActionError";

import { publicationPublishedActions,publishedActionPermission } from "@/config/publicationPublishedActions";
import { publishedMutationSchema,type PublishedMutation } from "@/schemas/publications/published";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { z } from "zod";
import { adminEventSchema, adminNoticeSchema } from "@/schemas/publications/admin";

export async function mutatePublishedPublicationAction(input: PublishedMutation) {
    const parsed = publishedMutationSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message || "Confira os dados da publicação.");
    const data = parsed.data;
    const config = publicationPublishedActions[data.type];
    const permission = publishedActionPermission(data.type, data.action);
    if (!permission || !await haveActionPermission("PUBLICATIONS", permission)) throw new ActionError("Você não tem permissão para realizar esta ação.");
    if (await haveActionPermission("PUBLICATIONS", config.read)) {
        const current = await actionFetchWrapper<{ status?: string; publicationStatus?: string; eventStatus?: string }>({
            url: `${config.path}/${data.id}`, method: "GET", cache: "no-store",
            schema: data.type === "EVENT" ? z.object({ publicationStatus: z.string(), eventStatus: z.string() }) : z.object({ status: z.string() }),
        });
        const status = current.data.status ?? current.data.publicationStatus;
        if ((data.action === 'archive' && status !== 'PUBLISHED') || (data.action === 'edit' && status === 'ARCHIVED')) throw new ActionError('O estado desta publicação mudou. Releia o detalhe.', { status: 409 });
        if (data.action === "cancel" && !["OPEN", "IN_PROGRESS", "CANCELLED"].includes(current.data.eventStatus ?? "")) throw new ActionError("Este evento não pode mais ser cancelado.", { status: 409 });
        if (data.action === "finish" && current.data.eventStatus !== "IN_PROGRESS") throw new ActionError("Somente eventos em andamento podem ser encerrados.", { status: 409 });
    }
    if (data.action === "delete") {
        await actionFetchWrapper<unknown>({ url: `${config.path}/${data.id}`, method: "DELETE", schema: z.undefined() });
    } else if (data.action === "edit") {
        await actionFetchWrapper<unknown>({ url: `${config.path}/${data.id}`, method: "PATCH", body: JSON.stringify({ title: data.title, content: data.content }), schema: data.type === "EVENT" ? adminEventSchema : adminNoticeSchema });
    } else {
        await actionFetchWrapper<unknown>({ url: `${config.path}/${data.id}/${data.action}`, method: "POST", schema: data.type === "EVENT" ? adminEventSchema.extend({ eventStatus: z.literal(data.action === "finish" ? "FINISHED" : "CANCELLED") }) : adminNoticeSchema.extend({ status: z.literal("ARCHIVED") }) });
    }
    return { id: data.id, type: data.type, action: data.action };
}
