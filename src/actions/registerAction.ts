'use server';

import { registerService } from '@/services/fetchWrapper/registerService';
import { RegisterData } from '@/stores/useRegisterStore';
import { redirect } from 'next/navigation';

type RegisterActionResult = {
    success: false;
    error: string;
};

export async function registerAction(data: RegisterData) {
    try {
        await registerService(data);
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
