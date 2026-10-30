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

export async function registerForEventAction(eventId: number, input: { vehicleId: number; dependentIds: number[] }) {
    const id = idSchema.parse(eventId);
    const data = z.object({ vehicleId: idSchema, dependentIds: z.array(idSchema) }).parse(input);
    await requirePermission("EVENT_REGISTER");
    const result = await actionFetchWrapper({
        url: `events/${id}/registrations`,
        method: "POST",
        body: JSON.stringify({ allocations: [{ vehicleId: data.vehicleId, member: true, dependentIds: data.dependentIds }], dependentIds: [] }),
        schema: eventRegistrationSchema,
    });
    return result.data;
}

export async function requestEventGuestAction(eventId: number, input: { vehicleId: number; cpf: string; guestName: string }) {
    const id = idSchema.parse(eventId);
    const data = z.object({ vehicleId: idSchema, cpf: z.string().regex(/^\d{11}$/), guestName: z.string().trim().min(2).max(150) }).parse(input);
    await requirePermission("EVENT_GUEST_REQUEST_CREATE");
    const result = await actionFetchWrapper({
        url: `events/${id}/guest-requests`,
        method: "POST",
        body: JSON.stringify(data),
        schema: z.object({ id: idSchema, eventId: idSchema, guestName: z.string(), status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]) }),
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
