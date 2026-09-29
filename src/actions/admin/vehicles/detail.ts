'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { vehicleDetailResponseSchema } from "@/schemas/vehicles/detail";

export async function getVehicleDetailAdminAction(vehicleId: number) {
    try {
        const response = await actionFetchWrapper<VehicleDetail>({
            url: `${HttpAPIRoutes.VEHICLES_DETAIL_ADMIN}/${vehicleId}`,
            method: 'GET',
            schema: vehicleDetailResponseSchema,
        });
        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao carregar dados do veículo'), { cause: error });
    }
}
