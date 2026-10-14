'use server';

import { fetchWrapper } from '@/services/fetchWrapper/fetchWrapper';
import { membershipApplicationSubmissionSchema } from '@/schemas/membership/application';
import { HttpAPIRoutes } from '@/utils/http/api';
import { extractApiErrorCode, extractApiErrorMessage } from '@/utils/http/apiError';
import { unMaskCPF } from '@/utils/masks/maskCPF';
import { unMaskPhoneNumber } from '@/utils/masks/maskPhoneNumber';
import { getFrontendAccessHeaders } from '@/services/fetchWrapper/frontendAccess';

export type MembershipApplicationActionResult =
    | { ok: true; data: MembershipApplicationSubmission }
    | { ok: false; message: string };

export async function submitMembershipApplicationAction(form: MembershipApplicationForm): Promise<MembershipApplicationActionResult> {
    const apiUrl = process.env.API_URL;
    if (!apiUrl) return { ok: false, message: "O serviço está indisponível no momento. Tente novamente mais tarde." };
    try {
        const response = await fetchWrapper<MembershipApplicationSubmission>({
            url: `${apiUrl.replace(/\/$/, '')}/${HttpAPIRoutes.MEMBERSHIP_APPLICATIONS}`,
            method: 'POST',
            headers: getFrontendAccessHeaders(),
            body: JSON.stringify({
                ...form,
                name: form.name.trim(),
                // Os inputs exibem as máscaras; a API recebe somente dígitos.
                cpf: unMaskCPF(form.cpf),
                phoneNumber: unMaskPhoneNumber(form.phoneNumber),
                email: form.email.trim() || null,
                message: form.message.trim(),
            }),
            schema: membershipApplicationSubmissionSchema,
        });
        return { ok: true, data: response.data };
    } catch (error) {
        const message = extractApiErrorCode(error) === "ACCESS_DENIED"
            ? "A integração com a API não está configurada. Configure a chave privada API_FRONTEND_KEY no servidor do site."
            : extractApiErrorMessage(error, "Não foi possível enviar sua solicitação. Confira os dados e tente novamente.");
        return { ok: false, message };
    }
}
