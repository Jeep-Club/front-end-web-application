'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { roleListResponseSchema } from "@/schemas/authorization/list";

export async function listRolesAction(): Promise<RoleResponse[]> {
    try {
        const response = await actionFetchWrapper<RoleResponse[]>({
            url: HttpAPIRoutes.AUTHORIZATION_ROLES,
            method: 'GET',
            schema: roleListResponseSchema,
        });

        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao listar cargos'), { cause: error });
    }
}
