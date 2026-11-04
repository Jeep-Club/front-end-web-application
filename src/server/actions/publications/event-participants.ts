"use server";

import { z } from "zod";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { ActionError } from "@/utils/actions/actionResult";
import { captureAction } from "@/utils/actions/captureAction";

const participantSchema = z.object({
    registrationId: z.number().nullable(), userId: z.number(), name: z.string().nullable(), profilePhotoStorageKey: z.string().nullable(),
    registrationStatus: z.enum(["PENDING_PAYMENT", "CONFIRMED", "CANCELLED"]), registeredAt: z.string(),
    confirmedAt: z.string().nullable(), cancelledAt: z.string().nullable(),
    charges: z.array(z.object({ memberChargeId: z.number().nullable(), chargeDefinitionId: z.number(), name: z.string().nullable(), amount: z.number().nullable(), status: z.string(), paymentStatus: z.string().nullable(), paymentSubmittedAt: z.string().nullable() })),
});

async function listEventParticipantsActionImpl(eventId: number) {
    const id = z.number().int().positive().parse(eventId);
    if (!await haveActionPermission("PUBLICATIONS", "EVENT_ADMIN_DASHBOARD_READ")) throw new Error("Você não tem permissão para consultar os participantes deste evento.");
    try {
        const result = await actionFetchWrapper({ url: `admin/events/${id}/participants`, method: "GET", cache: "no-store", schema: z.array(participantSchema) });
        return result.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, "Não foi possível carregar os participantes do evento."), { cause: error });
    }
}

export async function listEventParticipantsAction(eventId: number) {
    return captureAction(() => listEventParticipantsActionImpl(eventId));
}
