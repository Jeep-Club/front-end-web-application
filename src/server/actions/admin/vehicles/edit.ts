'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { editVehicleMemberResponseSchema } from "@/schemas/vehicles/edit";

async function editVehicleAdminActionImpl(vehicleId: number, data: EditVehicleMemberRequest) {
    try {
        await actionFetchWrapper({
            url: `${HttpAPIRoutes.VEHICLES_EDIT_ADMIN}/${vehicleId}`,
            method: 'PUT',
            schema: editVehicleMemberResponseSchema,
            body: JSON.stringify(data),
        });
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao editar veículo'), { cause: error });
    }
}


export async function editVehicleAdminAction(...args: Parameters<typeof editVehicleAdminActionImpl>) {
    return captureAction(() => editVehicleAdminActionImpl(...args));
}
