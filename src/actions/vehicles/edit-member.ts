'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { editVehicleMemberResponseSchema } from "@/schemas/vehicles/edit";

export async function editVehicleMemberAction(vehicleId: number, data: EditVehicleMemberRequest) {
    try {
        await actionFetchWrapper({
            url: `${HttpAPIRoutes.VEHICLES_EDIT_MEMBER}/${vehicleId}`,
            method: 'PUT',
            schema: editVehicleMemberResponseSchema,
            body: JSON.stringify(data),
        });
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao editar veículo'), { cause: error });
    }
}
