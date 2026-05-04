'use server';

import { registerService } from '@/services/fetchWrapper/registerService';
import { RegisterData } from '@/stores/useRegisterStore';
import { redirect } from 'next/navigation';

export async function registerAction(data: RegisterData) {
    try {
        await registerService(data);
    } catch (error) {
        throw new Error('Erro ao realizar cadastro, tente novamente.');
    }

    redirect('/login');
}