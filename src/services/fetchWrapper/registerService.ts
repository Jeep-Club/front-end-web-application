import { RegisterFormData } from '@/schemas/registerSchema';

export async function registerService(data: RegisterFormData) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_API_URL nao configurada');
    }

    const payload = {
        name: data.fullName,
        birthData: data.birthDate,
        email: data.email,
        cpf: data.cpf,
        rg: data.rg,
        password: data.password,
        phoneNumber: data.phone,
    };

    const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    const responseData = responseText ? tryParseJson(responseText) : null;

    if (!response.ok) {
        throw new Error(responseData?.message || responseData?.error || responseText || 'Erro ao realizar cadastro');
    }

    return responseData;
}

function tryParseJson(text: string) {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}
