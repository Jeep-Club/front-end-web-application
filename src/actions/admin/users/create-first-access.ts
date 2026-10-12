'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { adminFirstAccessUserResponseSchema } from "@/schemas/admin/first-access-user";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function createFirstAccessUserAction(user: AdminFirstAccessUserRequest) {
    const response = await actionFetchWrapper<AdminFirstAccessUserResponse>({
        url: HttpAPIRoutes.ADMIN_FIRST_ACCESS_USER,
        method: "POST",
        body: JSON.stringify(user),
        schema: adminFirstAccessUserResponseSchema,
    });

    return response.data;
}
