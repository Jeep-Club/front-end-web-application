'use server';

import { vehicleDetailForEditResponseSchema } from "@/schemas/vehicles/detail-for-edit";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function getVehicleDetailForEditAction(vehicleId: number) {
    const response = await actionFetchWrapper<VehicleDetailForEdit>({
        url: `${HttpAPIRoutes.VEHICLES_DETAIL_FOR_EDIT_MEMBER}/${vehicleId}`,
        method: 'GET',
        schema: vehicleDetailForEditResponseSchema,
    });
    return response.data;
}
