'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { roleListResponseSchema } from "@/schemas/authorization/list";

export async function listUserRolesAction(userId: number): Promise<RoleListResponse> {
    try {
        const response = await actionFetchWrapper<RoleListResponse>({
            url: HttpAPIRoutes.USER_ROLES.replace("{id}", String(userId)),
            method: 'GET',
            schema: roleListResponseSchema,
        });

        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao listar papéis do usuário'), { cause: error });
    }
}
