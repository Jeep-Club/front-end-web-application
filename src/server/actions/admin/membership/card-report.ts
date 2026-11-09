"use server";

import { cookies } from "next/headers";
import { z } from "zod";

import { getAdminMemberRegistrationAction } from "@/server/actions/admin/membership/memberRegistry";
import { getAdminUserProfileAction } from "@/server/actions/admin/users/update";
import { ActionError } from "@/utils/http/ActionError";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { meCookieSchema } from "@/schemas/auth/me/me";
import { verifyWithSchema } from "@/services/token/verify";

/** Returns the operator and current membership number after checking both required admin scopes. */
export async function getAdminCardReportContextAction(userId: number) {
    const id = z.number().int().positive().parse(userId);
    if (!await haveActionPermission("IDENTITY", "USER_READ") || !await haveActionPermission("MEMBERSHIP", "MEMBER_READ")) {
        throw new ActionError("Você não tem permissão para exportar a ficha deste associado.");
    }

    const token = (await cookies()).get("Me")?.value;
    if (!token) throw new ActionError("Não foi possível identificar quem está gerando o documento.");
    const operator = await verifyWithSchema<MeCookie>(token, meCookieSchema);
    if (!operator.userName.trim()) throw new ActionError("Não foi possível identificar quem está gerando o documento.");

    const registration = await getAdminMemberRegistrationAction(id);
    let profile: AdminUserComplementaryProfile;
    try {
        profile = await getAdminUserProfileAction(id);
    } catch (error) {
        if (!(error instanceof ActionError) || error.status !== 404) throw error;
        profile = { workProfile: null, address: null, profileCompletionPending: true, membershipNumber: null };
    }
    return {
        exportedBy: operator.userName,
        membershipNumber: registration?.membershipNumber ?? null,
        membershipCreatedAt: registration?.createdAt ?? null,
        profile,
    };
}
