'use server';

import { z } from "zod";
import { adminUserDeletionHistorySchema, adminUserSchema } from "@/schemas/admin/users";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

interface PatchUserStatusProps {
    userId: number;
    status: AdminUserLifecycleAction;
}

export async function patchUserStatusAction({ userId, status }: PatchUserStatusProps): Promise<AdminUser> {
    z.number().int().positive().parse(userId);
    z.enum(["enable", "disable", "archive", "unarchive"]).parse(status);

    const res = await actionFetchWrapper<AdminUser>({
        url: `${HttpAPIRoutes.ADMIN_USERS}/${userId}/${status}`,
        method: "PATCH",
        cache: "no-store",
        schema: adminUserSchema,
    });

    return res.data;
}

export async function deleteAdminUserAction(userId: number): Promise<void> {
    z.number().int().positive().parse(userId);
    await actionFetchWrapper({
        url: `${HttpAPIRoutes.ADMIN_USERS}/${userId}`,
        method: "DELETE",
        cache: "no-store",
        schema: z.unknown(),
    });
}

export async function getAdminUserDeletionHistoryAction(userId: number): Promise<AdminUserDeletionHistory> {
    z.number().int().positive().parse(userId);
    const res = await actionFetchWrapper<AdminUserDeletionHistory>({
        url: `${HttpAPIRoutes.ADMIN_USERS}/${userId}/deletion-history`,
        method: "GET",
        cache: "no-store",
        schema: adminUserDeletionHistorySchema,
    });
    return res.data;
}
