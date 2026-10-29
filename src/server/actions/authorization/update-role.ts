'use server';

import { roleResponseSchema } from "@/schemas/authorization/detail";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function updateRoleAction(roleId: number, data: UpdateRoleRequest): Promise<RoleResponse> {
    const response = await actionFetchWrapper<RoleResponse>({
        url: `${HttpAPIRoutes.AUTHORIZATION_ROLES}/${roleId}`,
        method: 'PUT',
        schema: roleResponseSchema,
        body: JSON.stringify(data),
    });

    return response.data;
}
