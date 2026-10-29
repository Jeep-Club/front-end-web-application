'use server';

import { adminCreateUserResponseSchema } from "@/schemas/admin/create-user";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function createFirstAccessUserAction(form: AdminCreateUserForm): Promise<AdminCreateUserResponse> {
    const request: AdminCreateUserRequest = {
        name: form.name.trim(),
        birthDate: form.birthDate || null,
        email: form.email.trim() || null,
        cpf: form.cpf,
        rg: form.rg.trim() || null,
        phoneNumber: form.phoneNumber.trim() || null,
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
