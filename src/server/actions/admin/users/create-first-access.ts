'use server';

import { adminCreateUserResponseSchema } from "@/schemas/admin/create-user";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { unMaskCPF, unMaskPhoneNumber } from "@/utils/masks";

export async function createFirstAccessUserAction(form: AdminCreateUserForm): Promise<AdminCreateUserResponse> {
    const normalizedPhone = unMaskPhoneNumber(form.phoneNumber);
    const normalizedRg = form.rg.replace(/\D/g, "");

    const request: AdminCreateUserRequest = {
        name: form.name.trim(),
        birthDate: form.birthDate || null,
        email: form.email.trim().toLowerCase() || null,
        cpf: unMaskCPF(form.cpf),
        rg: normalizedRg || null,
        phoneNumber: normalizedPhone || null,
        activationMethod: form.activationMethod as AdminUserActivationMethod,
    };

    const response = await actionFetchWrapper<AdminCreateUserResponse>({
        url: HttpAPIRoutes.ADMIN_CREATE_USER,
        method: "POST",
        body: JSON.stringify(request),
        schema: adminCreateUserResponseSchema,
    });

    return response.data;
}
