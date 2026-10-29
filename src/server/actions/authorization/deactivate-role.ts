'use server';

import { roleResponseSchema } from "@/schemas/authorization/detail";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function deactivateRoleAction(roleId: number): Promise<RoleResponse> {
    const response = await actionFetchWrapper<RoleResponse>({
        url: `${HttpAPIRoutes.AUTHORIZATION_ROLES}/${roleId}/deactivate`,
        method: 'PATCH',
        schema: roleResponseSchema,
    });

    return response.data;
}
