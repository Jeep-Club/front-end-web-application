'use server';

import { includeVehicleMemberResponseSchema } from "@/schemas/vehicles/include";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function includeVehicleMemberAction(data: FormData) {
    await actionFetchWrapper({
        url: HttpAPIRoutes.VEHICLES_INCLUDE_MEMBER,
        method: 'POST',
        schema: includeVehicleMemberResponseSchema,
        body: data,
    });
}
