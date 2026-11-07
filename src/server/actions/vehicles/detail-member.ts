'use server';

import { vehicleDetailResponseSchema } from "@/schemas/vehicles/detail";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function getVehicleDetailAction(vehicleId: number) {
    const response = await actionFetchWrapper<VehicleDetail>({
        url: `${HttpAPIRoutes.VEHICLES_DETAIL_MEMBER}/${vehicleId}`,
        method: 'GET',
        schema: vehicleDetailResponseSchema,
    });
    return response.data;
}
