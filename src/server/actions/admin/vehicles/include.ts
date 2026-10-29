'use server';

import { includeVehicleMemberResponseSchema } from "@/schemas/vehicles/include";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function includeVehicleAdminAction(memberId: number, data: FormData) {
    await actionFetchWrapper({
        url: `${HttpAPIRoutes.VEHICLES_INCLUDE_ADMIN}/${memberId}`,
        method: 'POST',
        schema: includeVehicleMemberResponseSchema,
        body: data,
    });
}
