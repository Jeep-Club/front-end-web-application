'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { vehicleDetailForEditResponseSchema } from "@/schemas/vehicles/detail-for-edit";

export async function getVehicleDetailForEditAdminAction(vehicleId: number) {
    try {
        const response = await actionFetchWrapper<VehicleDetailForEdit>({
            url: `${HttpAPIRoutes.VEHICLES_DETAIL_FOR_EDIT_ADMIN}/${vehicleId}`,
            method: 'GET',
            schema: vehicleDetailForEditResponseSchema,
        });
        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao carregar dados do veículo'), { cause: error });
    }
}
