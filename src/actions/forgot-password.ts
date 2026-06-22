'use server';

import { ForgotPasswordRequestType } from "@/schemas/auth/forgot-password/forgotPasswordRequest";

export default async function forgotPasswordAction(data: ForgotPasswordRequestType) {
    // 1. Simula o tempo de resposta do servidor (ex: 2 segundos)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
        // 2. Cria uma regra para simular um erro.
        // Se você digitar um CPF só com zeros, ele vai forçar a falha.
        if (data.cpf === '00000000000') {
            throw new Error('Usuário não encontrado em nossa base de dados.');
        }

        // 3. Se não for o CPF de erro, simula o sucesso da API
        console.log("Mock: CPF recebido com sucesso no backend:", data.cpf);

        return {
            success: true,
            message: "Instruções enviadas com sucesso!"
        };

    } catch (error: any) {
        // Lança o erro para o React Query capturar no frontend
        throw new Error(error.message || 'Erro interno no servidor mockado.');
    }
}