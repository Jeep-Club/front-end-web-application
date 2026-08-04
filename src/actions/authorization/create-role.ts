'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { roleResponseSchema } from "@/schemas/authorization/role";

export async function createRoleAction(data: CreateRoleRequest): Promise<RoleResponse> {
    try {
        const response = await actionFetchWrapper<RoleResponse>({
            url: HttpAPIRoutes.AUTHORIZATION_ROLES,
            method: 'POST',
            schema: roleResponseSchema,
            body: JSON.stringify(data),
        });

        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao criar role'), { cause: error });
    }
}
