'use server';

import { adminUserSchema } from "@/schemas/admin/users";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function getAdminUserAction(userId: number): Promise<AdminUser> {
    const response = await actionFetchWrapper<AdminUser>({
        url: `${HttpAPIRoutes.ADMIN_USERS}/${userId}`,
        method: "GET",
        schema: adminUserSchema,
    });

    return response.data;
}
