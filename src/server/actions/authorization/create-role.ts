'use server';

import { roleResponseSchema } from "@/schemas/authorization/detail";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function createRoleAction(data: CreateRoleRequest): Promise<RoleResponse> {
    const response = await actionFetchWrapper<RoleResponse>({
        url: HttpAPIRoutes.AUTHORIZATION_ROLES,
        method: 'POST',
        schema: roleResponseSchema,
        body: JSON.stringify(data),
    });

    return response.data;
}
