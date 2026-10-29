'use server';

import { deleteVehicleMemberResponseSchema } from "@/schemas/vehicles/delete";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function deleteVehicleMemberAction(vehicleId: number) {
    await actionFetchWrapper({
        url: `${HttpAPIRoutes.VEHICLES_DELETE_MEMBER}/${vehicleId}`,
        method: 'DELETE',
        schema: deleteVehicleMemberResponseSchema,
    });
}
