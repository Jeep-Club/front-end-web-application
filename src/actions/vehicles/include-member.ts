'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { includeVehicleMemberResponseSchema } from "@/schemas/vehicles/include";

export async function includeVehicleMemberAction(data: IncludeVehicleMemberFormData) {
    try {
        await actionFetchWrapper({
            url: HttpAPIRoutes.VEHICLES_INCLUDE_MEMBER,
            method: 'POST',
            schema: includeVehicleMemberResponseSchema,
            body: JSON.stringify(data),
        });
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao cadastrar veículo'), { cause: error });
    }
}
