"use server";
import { ActionError } from "@/utils/http/ActionError";

import { publicationPublishedActions,publishedActionPermission } from "@/config/publicationPublishedActions";
import { publishedMutationSchema,type PublishedMutation } from "@/schemas/publications/published";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { z } from "zod";

export async function mutatePublishedPublicationAction(input: PublishedMutation) {
    const parsed = publishedMutationSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message || "Confira os dados da publicação.");
    const data = parsed.data;
    const config = publicationPublishedActions[data.type];
    const permission = publishedActionPermission(data.type, data.action);
    if (!permission || !await haveActionPermission("PUBLICATIONS", permission)) throw new ActionError("Você não tem permissão para realizar esta ação.");
    if (!await haveActionPermission("PUBLICATIONS", config.read)) throw new ActionError("Você não tem permissão para consultar esta publicação.");
    const current = await actionFetchWrapper<{ status?: string; publicationStatus?: string; eventStatus?: string }>({
        url: `${config.path}/${data.id}`, method: "GET", cache: "no-store",
        schema: data.type === "EVENT" ? z.object({ publicationStatus: z.string(), eventStatus: z.string() }) : z.object({ status: z.string() }),
    });
    if ((current.data.status ?? current.data.publicationStatus) !== "PUBLISHED") throw new ActionError("O estado desta publicação mudou. Atualize a lista antes de continuar.");
    if (data.action === "cancel" && !["OPEN", "IN_PROGRESS"].includes(current.data.eventStatus ?? "")) throw new ActionError("Este evento não pode mais ser cancelado.");
    if (data.action === "finish" && current.data.eventStatus !== "IN_PROGRESS") throw new ActionError("Somente eventos em andamento podem ser encerrados.");
    if (data.action === "delete") {
        await actionFetchWrapper({ url: `${config.path}/${data.id}`, method: "DELETE", schema: z.literal("") });
    } else if (data.action === "edit") {
        await actionFetchWrapper({ url: `${config.path}/${data.id}`, method: "PATCH", body: JSON.stringify({ title: data.title, content: data.content }), schema: z.object({ id: z.number() }) });
    } else {
        await actionFetchWrapper({ url: `${config.path}/${data.id}/${data.action}`, method: "POST", schema: z.object({ id: z.number() }) });
    }
    return { id: data.id, type: data.type, action: data.action };
}
