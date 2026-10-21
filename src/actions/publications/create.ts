"use server";

import { z } from "zod";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { createPublicationSchema, type CreatePublicationRequest } from "@/schemas/publications/create";
import { publicationCreationTypes } from "@/config/publicationCreation";

export async function createPublicationAction(input: CreatePublicationRequest) {
    const parsed = createPublicationSchema.safeParse(input);
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Confira os dados da publicação.");
    const { type, ...payload } = parsed.data;
    const config = publicationCreationTypes.find((entry) => entry.type === type)!;
    if (!await haveActionPermission("PUBLICATIONS", config.action)) throw new Error("Você não tem permissão para criar este tipo de publicação.");
    try {
        const response = await actionFetchWrapper<{ id: number }>({
            url: config.endpoint,
            method: "POST",
            body: JSON.stringify(payload),
            schema: type === "EVENT"
                ? z.object({ id: z.number(), publicationStatus: z.literal("DRAFT") })
                : type === "NOTICE" ? z.object({ id: z.number(), status: z.literal("DRAFT") }) : z.object({ id: z.number(), status: z.literal("PENDING") }),
        });
        return { id: response.data.id, type };
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, "Não foi possível criar a publicação."), { cause: error });
    }
}