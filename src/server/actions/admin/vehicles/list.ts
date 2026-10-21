'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { listVehicleMemberResponseSchema } from "@/schemas/vehicles/list";
import { extractApiErrorMessage } from "@/utils/http/apiError";

interface Props {
    page?: number;
    size?: number;
}

async function listVehiclesAdminActionImpl({ page = 0, size = 10 }: Props = {}) {
    size = Math.min(Math.max(size, 1), 50);
    try {
        const response = await actionFetchWrapper<ListVehicleMemberResponse>({
            url: `${HttpAPIRoutes.VEHICLES_LIST_ADMIN}?page=${page}&size=${size}`,
            method: 'GET',
            schema: listVehicleMemberResponseSchema,
        });
        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao carregar veículos'), { cause: error });
    }
}


export async function listVehiclesAdminAction(...args: Parameters<typeof listVehiclesAdminActionImpl>) {
    return captureAction(() => listVehiclesAdminActionImpl(...args));
}
