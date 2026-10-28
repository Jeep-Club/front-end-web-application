'use server';

import { ActionError } from "@/utils/http/ActionError";

import { ResetPasswordRequestType } from "@/schemas/auth/reset-password/resetPasswordRequest";

// O tipo agora recebe os dados do form + o token que passaremos via componente
type ResetPasswordActionParams = ResetPasswordRequestType & { token: string };

export default async function resetPasswordAction(data: ResetPasswordActionParams) {
    // 1. Simula o tempo de resposta do servidor
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (!data.token) {
        throw new ActionError('Token de segurança ausente ou inválido.');
    }

    // Mock: Simula o sucesso da API
    console.log("Mock: Senha alterada com sucesso! Token:", data.token);

    return { success: true };
}
