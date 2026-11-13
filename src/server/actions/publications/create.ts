"use server";
import { ActionError } from "@/utils/http/ActionError";

import { publicationCreationTypes } from "@/config/publicationCreation";
import { createPublicationSchema,type CreatePublicationRequest } from "@/schemas/publications/create";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { z } from "zod";
import { adminEventSchema, adminNoticeSchema } from "@/schemas/publications/admin";

export async function createPublicationAction(input: CreatePublicationRequest) {
    const parsed = createPublicationSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message || "Confira os dados da publicação.");
    const { type, ...payload } = parsed.data;
    const config = publicationCreationTypes.find((entry) => entry.type === type)!;
    if (!await haveActionPermission("PUBLICATIONS", config.action)) throw new ActionError("Você não tem permissão para criar este tipo de publicação.");
    const response = await actionFetchWrapper<{ id: number }>({
        url: config.endpoint,
        method: "POST",
        body: JSON.stringify(payload),
        schema: type === "EVENT"
            ? adminEventSchema.extend({ publicationStatus: z.literal("DRAFT") })
            : type === "NOTICE" ? adminNoticeSchema.extend({ status: z.literal("DRAFT") }) : z.object({ id: z.number(), status: z.literal("PENDING") }),
    });
    return { id: response.data.id, type };
}
