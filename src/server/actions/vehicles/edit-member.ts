'use server';

import { vehicleDetailResponseSchema } from "@/schemas/vehicles/detail";
import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { editVehicleMemberResponseSchema } from "@/schemas/vehicles/edit";

async function editVehicleMemberActionImpl(vehicleId: number, data: EditVehicleMemberRequest, gallery?: FormData) {
    try {
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
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao editar veículo'), { cause: error });
    }
}


export async function editVehicleMemberAction(...args: Parameters<typeof editVehicleMemberActionImpl>) {
    return captureAction(() => editVehicleMemberActionImpl(...args));
}
