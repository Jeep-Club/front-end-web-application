'use server';

import { deleteVehicleMemberResponseSchema } from "@/schemas/vehicles/delete";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function deleteVehicleAdminAction(vehicleId: number) {
    await actionFetchWrapper({
        url: `${HttpAPIRoutes.VEHICLES_DELETE_ADMIN}/${vehicleId}`,
        method: 'DELETE',
        schema: deleteVehicleMemberResponseSchema,
    });
}
