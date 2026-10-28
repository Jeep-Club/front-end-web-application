'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { deleteVehicleMemberResponseSchema } from "@/schemas/vehicles/delete";

async function deleteVehicleMemberActionImpl(vehicleId: number) {
    try {
        await actionFetchWrapper({
            url: `${HttpAPIRoutes.VEHICLES_DELETE_MEMBER}/${vehicleId}`,
            method: 'DELETE',
            schema: deleteVehicleMemberResponseSchema,
        });
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao excluir veículo'), { cause: error });
    }
}


export async function deleteVehicleMemberAction(...args: Parameters<typeof deleteVehicleMemberActionImpl>) {
    return captureAction(() => deleteVehicleMemberActionImpl(...args));
}
