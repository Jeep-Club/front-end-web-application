'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import { ResetPasswordRequestType } from "@/schemas/auth/reset-password/resetPasswordRequest";

// O tipo agora recebe os dados do form + o token que passaremos via componente
type ResetPasswordActionParams = ResetPasswordRequestType & { token: string };

async function resetPasswordActionImpl(data: ResetPasswordActionParams) {
    // 1. Simula o tempo de resposta do servidor
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
        if (!data.token) {
            throw new ActionError('Token de segurança ausente ou inválido.');
        }

        // Mock: Simula o sucesso da API
        console.log("Mock: Senha alterada com sucesso! Token:", data.token);

        return { success: true };
    } catch (error: unknown) {
        throw new ActionError(error instanceof ActionError ? error.message : 'Erro ao redefinir a senha.');
    }
}

export default async function resetPasswordAction(...args: Parameters<typeof resetPasswordActionImpl>) {
    return captureAction(() => resetPasswordActionImpl(...args));
}
