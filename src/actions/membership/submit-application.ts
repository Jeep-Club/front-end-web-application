'use server';

import { fetchWrapper } from '@/services/fetchWrapper/fetchWrapper';
import { membershipApplicationSubmissionSchema } from '@/schemas/membership/application';
import { HttpAPIRoutes } from '@/utils/http/api';
import { extractApiErrorMessage } from '@/utils/http/apiError';

export async function submitMembershipApplicationAction(form: MembershipApplicationForm) {
    const apiUrl = process.env.API_URL;
    if (!apiUrl) throw new Error('API_URL não está configurada.');
    try {
        const response = await fetchWrapper<MembershipApplicationSubmission>({
            url: `${apiUrl.replace(/\/$/, '')}/${HttpAPIRoutes.MEMBERSHIP_APPLICATIONS}`,
            method: 'POST',
            body: JSON.stringify({
                ...form,
                name: form.name.trim(),
                cpf: form.cpf,
                phoneNumber: form.phoneNumber,
                email: form.email.trim() || null,
                message: form.message.trim(),
            }),
            schema: membershipApplicationSubmissionSchema,
        });
        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Não foi possível enviar sua solicitação. Confira os dados e tente novamente.'), { cause: error });
    }
}
