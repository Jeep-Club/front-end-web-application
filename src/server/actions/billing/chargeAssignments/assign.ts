'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

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
        throw new ActionError(
            extractApiErrorMessage(error, "Erro ao criar atribuição de cobrança"),
            { cause: error },
        );
    }
}

async function assignChargeToAllMembersActionImpl(chargeDefinitionId: number): Promise<ChargeAssignment> {
    return postAssignment(
        `${HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS}/${chargeDefinitionId}/assignments/all-members`,
    );
}

async function assignChargeToUserActionImpl(chargeDefinitionId: number, userId: number): Promise<ChargeAssignment> {
    return postAssignment(
        `${HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS}/${chargeDefinitionId}/assignments/users/${userId}`,
    );
}

async function assignChargeToRoleActionImpl(chargeDefinitionId: number, roleId: number): Promise<ChargeAssignment> {
    return postAssignment(
        `${HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS}/${chargeDefinitionId}/assignments/roles/${roleId}`,
    );
}

async function assignChargeToEventParticipantsActionImpl(
    chargeDefinitionId: number,
    eventId: number,
): Promise<ChargeAssignment> {
    return postAssignment(
        `${HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS}/${chargeDefinitionId}/assignments/events/${eventId}/participants`,
    );
}


export async function assignChargeToAllMembersAction(...args: Parameters<typeof assignChargeToAllMembersActionImpl>) {
    return captureAction(() => assignChargeToAllMembersActionImpl(...args));
}


export async function assignChargeToUserAction(...args: Parameters<typeof assignChargeToUserActionImpl>) {
    return captureAction(() => assignChargeToUserActionImpl(...args));
}


export async function assignChargeToRoleAction(...args: Parameters<typeof assignChargeToRoleActionImpl>) {
    return captureAction(() => assignChargeToRoleActionImpl(...args));
}


export async function assignChargeToEventParticipantsAction(...args: Parameters<typeof assignChargeToEventParticipantsActionImpl>) {
    return captureAction(() => assignChargeToEventParticipantsActionImpl(...args));
}
