'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { deleteVehicleMemberResponseSchema } from "@/schemas/vehicles/delete";

export async function deleteVehicleMemberAction(vehicleId: number) {
    try {
        await actionFetchWrapper({
            url: `${HttpAPIRoutes.VEHICLES_DELETE_MEMBER}/${vehicleId}`,
            method: 'DELETE',
            schema: deleteVehicleMemberResponseSchema,
        });
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao excluir veículo'), { cause: error });
    }
}
