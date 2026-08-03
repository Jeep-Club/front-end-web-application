'use server';

import { cookies } from "next/headers";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { includeVehicleMemberResponseSchema } from "@/schemas/vehicles/include";
import { meCookieSchema } from "@/schemas/auth/me/me";
import { verifyWithSchema } from "@/services/token/verify";

export async function includeVehicleMemberAction(data: IncludeVehicleMemberFormData) {
    try {
        const cookieStore = await cookies();
        const meToken = cookieStore.get('Me')?.value || '';
        const me = await verifyWithSchema<MeCookie>(meToken, meCookieSchema);

        const payload: IncludeVehicleMemberRequest = {
            ...data,
            ownerId: me.userId,
        };

        await actionFetchWrapper({
            url: HttpAPIRoutes.VEHICLES_INCLUDE_MEMBER,
            method: 'POST',
            schema: includeVehicleMemberResponseSchema,
            body: JSON.stringify(payload),
        });
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao cadastrar veículo'), { cause: error });
    }
}
