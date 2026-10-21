'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { includeVehicleMemberResponseSchema } from "@/schemas/vehicles/include";

async function includeVehicleAdminActionImpl(memberId: number, data: IncludeVehicleMemberRequest) {
    try {
        await actionFetchWrapper({
            url: `${HttpAPIRoutes.VEHICLES_INCLUDE_ADMIN}/${memberId}`,
            method: 'POST',
            schema: includeVehicleMemberResponseSchema,
            body: JSON.stringify(data),
        });
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao cadastrar veículo'), { cause: error });
    }
}


export async function includeVehicleAdminAction(...args: Parameters<typeof includeVehicleAdminActionImpl>) {
    return captureAction(() => includeVehicleAdminActionImpl(...args));
}
