import { RegisterData } from '@/stores/useRegisterStore';

export async function registerService(data: RegisterData) {
    const payload = {
        name: data.name,
        birthDate: data.birthDate,
        email: data.email,
        cpf: data.cpf,
        phoneNumber: data.phone,
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao realizar cadastro');
    }

    return response.json();
}