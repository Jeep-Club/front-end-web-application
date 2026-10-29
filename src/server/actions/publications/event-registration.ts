"use server";

import { ActionError } from "@/utils/http/ActionError";

import { z } from "zod";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { extractApiErrorCode } from "@/utils/http/apiError";
import { eventRegistrationSchema } from '@/schemas/publications/event-registration';

const idSchema = z.number().int().positive();

async function requirePermission(action: string) {
    if (!await haveActionPermission("PUBLICATIONS", action)) throw new ActionError("Você não tem permissão para realizar esta ação.");
}

export async function getMyEventRegistrationAction(eventId: number) {
    const id = idSchema.parse(eventId);
    await requirePermission("EVENT_REGISTRATION_READ");
    try {
        const result = await actionFetchWrapper({
            url: `events/${id}/registrations/me`, method: "GET", cache: "no-store", schema: eventRegistrationSchema,
        });
        return result.data;
    } catch (error) {
        if (extractApiErrorCode(error) === "EVENT_REGISTRATION_NOT_FOUND") return null;
        throw error;
    }
}

export async function registerForEventAction(eventId: number) {
    const id = idSchema.parse(eventId);
    await requirePermission("EVENT_REGISTER");
    const result = await actionFetchWrapper({
        url: `events/${id}/registrations`,
        method: "POST",
        body: JSON.stringify({ allocations: [], dependentIds: [] }),
        schema: eventRegistrationSchema,
    });
    return result.data;
}

export async function cancelMyEventRegistrationAction(eventId: number) {
    const id = idSchema.parse(eventId);
    await requirePermission("EVENT_REGISTRATION_CANCEL");
    const result = await actionFetchWrapper({
        url: `events/${id}/registrations/me/cancel`,
        method: "POST",
        schema: eventRegistrationSchema,
    });
    return result.data;
}
