'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { roleResponseSchema } from "@/schemas/authorization/detail";

export async function activateRoleAction(roleId: number): Promise<RoleResponse> {
    try {
        const response = await actionFetchWrapper<RoleResponse>({
            url: `${HttpAPIRoutes.AUTHORIZATION_ROLES}/${roleId}/activate`,
            method: 'PATCH',
            schema: roleResponseSchema,
        });

        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao ativar cargo'), { cause: error });
    }
}
