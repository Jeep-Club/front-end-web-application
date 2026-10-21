'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { roleListResponseSchema } from "@/schemas/authorization/list";

async function listRolesActionImpl(): Promise<RoleResponse[]> {
    try {
        const response = await actionFetchWrapper<RoleResponse[]>({
            url: HttpAPIRoutes.AUTHORIZATION_ROLES,
            method: 'GET',
            schema: roleListResponseSchema,
        });

        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao listar cargos'), { cause: error });
    }
}


export async function listRolesAction(...args: Parameters<typeof listRolesActionImpl>) {
    return captureAction(() => listRolesActionImpl(...args));
}
