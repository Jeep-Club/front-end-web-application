'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { roleListResponseSchema } from "@/schemas/authorization/list";

async function listUserRolesActionImpl(userId: number): Promise<RoleListResponse> {
    try {
        const response = await actionFetchWrapper<RoleListResponse>({
            url: HttpAPIRoutes.USER_ROLES.replace("{id}", String(userId)),
            method: 'GET',
            schema: roleListResponseSchema,
        });

        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao listar papéis do usuário'), { cause: error });
    }
}


export async function listUserRolesAction(...args: Parameters<typeof listUserRolesActionImpl>) {
    return captureAction(() => listUserRolesActionImpl(...args));
}
