'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { adminCreateUserResponseSchema } from "@/schemas/admin/create-user";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";

async function createFirstAccessUserActionImpl(form: AdminCreateUserForm): Promise<AdminCreateUserResponse> {
    const request: AdminCreateUserRequest = {
        name: form.name.trim(),
        birthDate: form.birthDate || null,
        email: form.email.trim() || null,
        cpf: form.cpf,
        rg: form.rg.trim() || null,
        phoneNumber: form.phoneNumber.trim() || null,
        activationMethod: form.activationMethod as AdminUserActivationMethod,
    };

    try {
        const response = await actionFetchWrapper<AdminCreateUserResponse>({
            url: HttpAPIRoutes.ADMIN_CREATE_USER,
            method: "POST",
            body: JSON.stringify(request),
            schema: adminCreateUserResponseSchema,
        });

        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, "Não foi possível criar o usuário. Confira os dados e tente novamente."), { cause: error });
    }
}


export async function createFirstAccessUserAction(...args: Parameters<typeof createFirstAccessUserActionImpl>) {
    return captureAction(() => createFirstAccessUserActionImpl(...args));
}
