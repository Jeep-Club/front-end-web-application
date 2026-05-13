'use server';

import { registerService } from '@/services/registerService';
import { registerFormSchema, RegisterFormData } from '@/schemas/registerSchema';
import { redirect } from 'next/navigation';

type RegisterActionResult = {
    success: false;
    error: string;
};

export async function registerAction(data: RegisterFormData) {
    // Valida os dados no servidor antes de chamar o service
    const parsed = registerFormSchema.safeParse(data);

    if (!parsed.success) {
        return {
            success: false,
            error: 'Dados inválidos. Verifique os campos e tente novamente.',
        } satisfies RegisterActionResult;
    }

    try {
        await registerService(parsed.data);
    } catch (error) {
        if (error instanceof Error) {
            return {
                success: false,
                error: error.message,
            } satisfies RegisterActionResult;
        }

        return {
            success: false,
            error: 'Erro ao realizar cadastro, tente novamente.',
        } satisfies RegisterActionResult;
    }

    redirect('/login');
}