"use server";

import { z } from "zod";
import {
    adminMemberRegistrationSchema,
    updateAdminMemberRegistrationSchema,
    type UpdateAdminMemberRegistrationInput,
} from "@/schemas/membership/memberRegistry";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { ActionError } from "@/utils/http/ActionError";
import { HttpAPIRoutes } from "@/utils/http/api";
import { haveActionPermission } from "@/utils/permission/actionPermissions";

const requireMembershipRead = async () => {
    if (!await haveActionPermission("MEMBERSHIP", "MEMBER_READ")) {
        throw new ActionError("Você não tem permissão para consultar matrículas.");
    }
};

export async function getAdminMemberRegistrationAction(userId: number): Promise<AdminMemberRegistration | null> {
    await requireMembershipRead();
    const id = z.number().int().positive().parse(userId);

    try {
        const response = await actionFetchWrapper<AdminMemberRegistration>({
            url: `${HttpAPIRoutes.ADMIN_MEMBERS}/by-identity/${id}`,
            method: "GET",
            cache: "no-store",
            schema: adminMemberRegistrationSchema,
        });
        return response.data;
    } catch (error) {
        if (error instanceof ActionError && error.status === 404) return null;
        throw error;
    }
}

export async function updateAdminMemberRegistrationAction(input: UpdateAdminMemberRegistrationInput): Promise<AdminMemberRegistration> {
    if (!await haveActionPermission("MEMBERSHIP", "MEMBER_REGISTRATION_MANAGE")) {
        throw new ActionError("Você não tem permissão para atribuir ou retificar matrículas.");
    }

    const request = updateAdminMemberRegistrationSchema.parse(input);
    const isCorrection = request.mode === "CORRECT";
    const body = isCorrection
        ? { membershipNumber: request.membershipNumber, expectedVersion: request.expectedVersion, reason: request.reason }
        : { membershipNumber: request.membershipNumber, reason: request.reason };
    const response = await actionFetchWrapper<AdminMemberRegistration>({
        url: isCorrection
            ? `${HttpAPIRoutes.ADMIN_MEMBERS}/by-identity/${request.userId}/membership-number`
            : `${HttpAPIRoutes.ADMIN_MEMBERS}/by-identity/${request.userId}`,
        method: isCorrection ? "PATCH" : "PUT",
        cache: "no-store",
        body: JSON.stringify(body),
        schema: adminMemberRegistrationSchema,
    });

    return response.data;
}
