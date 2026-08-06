'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { roleResponseSchema } from "@/schemas/authorization/detail";

export async function updateRoleAction(roleId: number, data: UpdateRoleRequest): Promise<RoleResponse> {
    try {
        const response = await actionFetchWrapper<RoleResponse>({
            url: `${HttpAPIRoutes.AUTHORIZATION_ROLES}/${roleId}`,
            method: 'PUT',
            schema: roleResponseSchema,
            body: JSON.stringify(data),
        });

        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao atualizar cargo'), { cause: error });
    }
}
