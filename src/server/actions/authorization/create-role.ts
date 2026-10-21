'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { roleResponseSchema } from "@/schemas/authorization/detail";

async function createRoleActionImpl(data: CreateRoleRequest): Promise<RoleResponse> {
    try {
        const response = await actionFetchWrapper<RoleResponse>({
            url: HttpAPIRoutes.AUTHORIZATION_ROLES,
            method: 'POST',
            schema: roleResponseSchema,
            body: JSON.stringify(data),
        });

        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao criar role'), { cause: error });
    }
}


export async function createRoleAction(...args: Parameters<typeof createRoleActionImpl>) {
    return captureAction(() => createRoleActionImpl(...args));
}
