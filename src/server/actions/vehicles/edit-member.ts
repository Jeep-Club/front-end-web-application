'use server';

import { vehicleDetailResponseSchema } from "@/schemas/vehicles/detail";

import { editVehicleMemberResponseSchema } from "@/schemas/vehicles/edit";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function editVehicleMemberAction(vehicleId: number, data: EditVehicleMemberRequest, gallery?: FormData) {
    await actionFetchWrapper({
        url: `${HttpAPIRoutes.VEHICLES_EDIT_MEMBER}/${vehicleId}`,
        method: 'PUT',
        schema: editVehicleMemberResponseSchema,
        body: JSON.stringify(data),
    });
    if (gallery) await actionFetchWrapper({
        url: `vehicles/gallery/member/${vehicleId}`,
        method: 'PUT',
        body: gallery,
        schema: vehicleDetailResponseSchema,
    });
}
