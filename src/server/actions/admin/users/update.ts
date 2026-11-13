"use server";

import { z } from "zod";
import { adminUserComplementaryProfileSchema, adminUserSchema } from "@/schemas/admin/users";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { unMaskCPF, unMaskPhoneNumber } from "@/utils/masks";

export async function updateAdminUserAction(
    userId: number,
    payload: AdminUpdateUserRequest,
): Promise<AdminUser> {
    z.number().int().positive().parse(userId);

    const body: AdminUpdateUserRequest = {};
    if (payload.name !== undefined) {
        body.name = payload.name.trim();
    }
    if (payload.cpf !== undefined) {
        body.cpf = unMaskCPF(payload.cpf);
    }
    if (payload.birthDate !== undefined) {
        body.birthDate = payload.birthDate && payload.birthDate.trim() ? payload.birthDate.trim() : null;
    }
    if (payload.email !== undefined) {
        const trimmedEmail = payload.email?.trim().toLowerCase() ?? "";
        body.email = trimmedEmail || null;
    }
    if (payload.rg !== undefined) {
        const digitsRg = (payload.rg ?? "").replace(/\D/g, "");
        body.rg = digitsRg || null;
    }
    if (payload.phoneNumber !== undefined) {
        const digitsPhone = unMaskPhoneNumber(payload.phoneNumber ?? "");
        body.phoneNumber = digitsPhone || null;
    }
    if (payload.profilePhotoStorageKey !== undefined) {
        body.profilePhotoStorageKey = payload.profilePhotoStorageKey?.trim() || null;
    }

    const res = await actionFetchWrapper<AdminUser>({
        url: `${HttpAPIRoutes.ADMIN_USERS}/${userId}`,
        method: "PATCH",
        cache: "no-store",
        body: JSON.stringify(body),
        schema: adminUserSchema,
    });

    return res.data;
}

export async function getAdminUserProfileAction(
    userId: number,
): Promise<AdminUserComplementaryProfile> {
    z.number().int().positive().parse(userId);
    const res = await actionFetchWrapper<AdminUserComplementaryProfile>({
        url: `${HttpAPIRoutes.ADMIN_USERS}/${userId}/profile`,
        method: "GET",
        cache: "no-store",
        schema: adminUserComplementaryProfileSchema,
    });
    return res.data;
}

export async function replaceAdminUserProfileAction(
    userId: number,
    payload: {
        workProfile: AdminUserWorkProfile | null;
        address: AdminUserResidentialAddress | null;
    },
): Promise<AdminUserComplementaryProfile> {
    z.number().int().positive().parse(userId);
    const res = await actionFetchWrapper<AdminUserComplementaryProfile>({
        url: `${HttpAPIRoutes.ADMIN_USERS}/${userId}/profile`,
        method: "PUT",
        cache: "no-store",
        body: JSON.stringify(payload),
        schema: adminUserComplementaryProfileSchema,
    });
    return res.data;
}
