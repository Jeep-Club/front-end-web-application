'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { includeVehicleMemberResponseSchema } from "@/schemas/vehicles/include";

async function includeVehicleMemberActionImpl(data: IncludeVehicleMemberRequest) {
    try {
        await actionFetchWrapper({
            url: HttpAPIRoutes.VEHICLES_INCLUDE_MEMBER,
            method: 'POST',
            schema: includeVehicleMemberResponseSchema,
            body: JSON.stringify(data),
        });
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao cadastrar veículo'), { cause: error });
    }
}


export async function includeVehicleMemberAction(...args: Parameters<typeof includeVehicleMemberActionImpl>) {
    return captureAction(() => includeVehicleMemberActionImpl(...args));
}
