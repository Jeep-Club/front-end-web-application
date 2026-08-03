'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { listVehicleMemberResponseSchema } from "@/schemas/vehicles/list";
import { extractApiErrorMessage } from "@/utils/http/apiError";

interface Props {
    page?: number;
    size?: number;
}

export async function listVehiclesMemberAction({ page = 0, size = 10 }: Props = {}) {
    try {
        const response = await actionFetchWrapper<ListVehicleMemberResponse>({
            url: `${HttpAPIRoutes.VEHICLES_LIST_MEMBER}?page=${page}&size=${size}`,
            method: 'GET',
            schema: listVehicleMemberResponseSchema,
        });
        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao carregar veículos'), { cause: error });
    }
}
