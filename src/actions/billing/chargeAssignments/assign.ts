'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { chargeAssignmentResponseSchema } from "@/schemas/billing/chargeAssignment";

async function postAssignment(url: string): Promise<ChargeAssignment> {
    try {
        const response = await actionFetchWrapper<ChargeAssignment>({
            url,
            method: "POST",
            schema: chargeAssignmentResponseSchema,
        });

        return response.data;
    } catch (error) {
        throw new Error(
            extractApiErrorMessage(error, "Erro ao criar atribuição de cobrança"),
            { cause: error },
        );
    }
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
