'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { adminUserListResponseSchema } from "@/schemas/admin/users";
import { extractApiErrorMessage } from "@/utils/http/apiError";

async function listAdminUsersActionImpl(
    searchParams: AdminUserSearchParams,
): Promise<PageResponse<AdminUser>> {
    const query = new URLSearchParams(
        Object.entries(searchParams).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
        ).filter(([key, value]) => key !== "status" || value !== "ALL"),
    );

    try {
        const response = await actionFetchWrapper<PageResponse<AdminUser>>({
            url: `${HttpAPIRoutes.ADMIN_USERS}?${query.toString()}`,
            method: "GET",
            schema: adminUserListResponseSchema,
        });

        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, "Erro ao carregar usuários"), { cause: error });
    }
}


export async function listAdminUsersAction(...args: Parameters<typeof listAdminUsersActionImpl>) {
    return captureAction(() => listAdminUsersActionImpl(...args));
}
