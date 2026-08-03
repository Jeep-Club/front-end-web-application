'use server';

import { ResetPasswordRequestType } from "@/schemas/auth/reset-password/resetPasswordRequest";

// O tipo agora recebe os dados do form + o token que passaremos via componente
type ResetPasswordActionParams = ResetPasswordRequestType & { token: string };

export default async function resetPasswordAction(data: ResetPasswordActionParams) {
    // 1. Simula o tempo de resposta do servidor
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
        if (!data.token) {
            throw new Error('Token de segurança ausente ou inválido.');
        }

        // Mock: Simula o sucesso da API
        console.log("Mock: Senha alterada com sucesso! Token:", data.token);

        return { success: true };
    } catch (error: any) {
        throw new Error(error.message || 'Erro ao redefinir a senha.');
    }
}