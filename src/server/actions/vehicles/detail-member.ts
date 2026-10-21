'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { vehicleDetailResponseSchema } from "@/schemas/vehicles/detail";

async function getVehicleDetailActionImpl(vehicleId: number) {
    try {
        const response = await actionFetchWrapper<VehicleDetail>({
            url: `${HttpAPIRoutes.VEHICLES_DETAIL_MEMBER}/${vehicleId}`,
            method: 'GET',
            schema: vehicleDetailResponseSchema,
        });
        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao carregar dados do veículo'), { cause: error });
    }
}


export async function getVehicleDetailAction(...args: Parameters<typeof getVehicleDetailActionImpl>) {
    return captureAction(() => getVehicleDetailActionImpl(...args));
}
