'use server';

import { chargeAssignmentResponseSchema } from "@/schemas/billing/chargeAssignment";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

async function postAssignment(url: string): Promise<ChargeAssignment> {
    const response = await actionFetchWrapper<ChargeAssignment>({
        url,
        method: "POST",
        schema: chargeAssignmentResponseSchema,
    });

    return response.data;
}

export async function assignChargeToAllMembersAction(chargeDefinitionId: number): Promise<ChargeAssignment> {
    return postAssignment(
        `${HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS}/${chargeDefinitionId}/assignments/all-members`,
    );
}

export async function assignChargeToUserAction(chargeDefinitionId: number, userId: number): Promise<ChargeAssignment> {
    return postAssignment(
        `${HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS}/${chargeDefinitionId}/assignments/users/${userId}`,
    );
}

export async function assignChargeToRoleAction(chargeDefinitionId: number, roleId: number): Promise<ChargeAssignment> {
    return postAssignment(
        `${HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS}/${chargeDefinitionId}/assignments/roles/${roleId}`,
    );
}

export async function assignChargeToEventParticipantsAction(
    chargeDefinitionId: number,
    eventId: number,
): Promise<ChargeAssignment> {
    return postAssignment(
        `${HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS}/${chargeDefinitionId}/assignments/events/${eventId}/participants`,
    );
}
