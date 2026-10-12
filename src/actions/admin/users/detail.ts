'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { adminUserSchema } from "@/schemas/admin/users";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";

export async function getAdminUserAction(userId: number): Promise<AdminUser> {
    try {
        const response = await actionFetchWrapper<AdminUser>({
            url: `${HttpAPIRoutes.ADMIN_USERS}/${userId}`,
            method: "GET",
            schema: adminUserSchema,
        });

        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, "Não foi possível carregar os dados deste usuário."), { cause: error });
    }
}
