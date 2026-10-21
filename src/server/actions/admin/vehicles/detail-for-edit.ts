'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { vehicleDetailForEditResponseSchema } from "@/schemas/vehicles/detail-for-edit";

async function getVehicleDetailForEditAdminActionImpl(vehicleId: number) {
    try {
        const response = await actionFetchWrapper<VehicleDetailForEdit>({
            url: `${HttpAPIRoutes.VEHICLES_DETAIL_FOR_EDIT_ADMIN}/${vehicleId}`,
            method: 'GET',
            schema: vehicleDetailForEditResponseSchema,
        });
        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao carregar dados do veículo'), { cause: error });
    }
}


export async function getVehicleDetailForEditAdminAction(...args: Parameters<typeof getVehicleDetailForEditAdminActionImpl>) {
    return captureAction(() => getVehicleDetailForEditAdminActionImpl(...args));
}
