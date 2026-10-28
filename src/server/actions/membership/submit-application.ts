'use server';

import { captureAction } from "@/utils/actions/captureAction";

import { fetchWrapper } from '@/services/fetchWrapper/fetchWrapper';
import { membershipApplicationSubmissionSchema } from '@/schemas/membership/application';
import { HttpAPIRoutes } from '@/utils/http/api';
import { extractApiErrorCode, extractApiErrorMessage, getApiProblem } from '@/utils/http/apiError';
import { unMaskCPF } from '@/utils/masks/maskCPF';
import { unMaskPhoneNumber } from '@/utils/masks/maskPhoneNumber';
import { getFrontendAccessHeaders } from '@/services/fetchWrapper/frontendAccess';

export type MembershipApplicationActionResult =
    | { ok: true; data: MembershipApplicationSubmission }
    | { ok: false; message: string };

function normalizeSubmissionPhoneNumber(phoneNumber: string): string {
    const digits = unMaskPhoneNumber(phoneNumber);
    if (digits.length === 13 && digits.startsWith('55')) {
        return digits.slice(2);
    }
    return digits;
}

function resolveMembershipApplicationErrorMessage(error: unknown): string {
    const code = extractApiErrorCode(error);
    const problem = getApiProblem(error);
    const status = (error as { status?: number })?.status ?? problem?.status;

    if (code === 'ACCESS_DENIED') {
        return 'A integração com a API não está configurada. Configure a chave privada API_FRONTEND_KEY no servidor do site.';
    }

    if (code === 'MEMBERSHIP_APPLICATION_NOT_ALLOWED' || status === 403) {
        return problem?.detail?.trim() || 'Não é possível realizar uma nova solicitação de associação.';
    }

    if (code === 'MEMBERSHIP_APPLICATION_ALREADY_EXISTS') {
        return problem?.detail?.trim() || 'Já existe uma solicitação para o CPF informado.';
    }

    if (code === 'MEMBERSHIP_CPF_ALREADY_REGISTERED') {
        return problem?.detail?.trim() || 'Já existe um usuário cadastrado com o CPF informado.';
    }

    if (code === 'MEMBERSHIP_EMAIL_ALREADY_IN_USE') {
        return problem?.detail?.trim() || 'Já existe uma solicitação de associação utilizando o e-mail informado.';
    }

    if (code === 'MEMBERSHIP_EMAIL_ALREADY_REGISTERED') {
        return problem?.detail?.trim() || 'Já existe um usuário cadastrado com o e-mail informado.';
    }

    if (code === 'CONFLICT' || status === 409) {
        return problem?.detail?.trim() || 'Já existe uma solicitação ou cadastro para os dados informados.';
    }

    if (code === 'VALIDATION_ERROR' || code === 'INVALID_REQUEST' || status === 400) {
        const firstFieldError = problem?.errors?.find((item) => item.message?.trim())?.message?.trim();
        if (firstFieldError) return firstFieldError;
        return problem?.detail?.trim() || 'Confira os dados informados e tente novamente.';
    }

    return extractApiErrorMessage(error, 'Não foi possível enviar sua solicitação. Confira os dados e tente novamente.');
}

async function submitMembershipApplicationActionImpl(form: MembershipApplicationForm): Promise<MembershipApplicationActionResult> {
    const apiUrl = process.env.API_URL;
    if (!apiUrl) return { ok: false, message: "O serviço está indisponível no momento. Tente novamente mais tarde." };
    try {
        const trimmedEmail = form.email?.trim() ?? '';
        const trimmedMessage = form.message?.trim() ?? '';

        const response = await fetchWrapper<MembershipApplicationSubmission>({
            url: `${apiUrl.replace(/\/$/, '')}/${HttpAPIRoutes.MEMBERSHIP_APPLICATIONS}`,
            method: 'POST',
            headers: getFrontendAccessHeaders(),
            body: JSON.stringify({
                name: form.name.trim(),
                // Os inputs exibem as máscaras; a API recebe somente dígitos.
                cpf: unMaskCPF(form.cpf),
                phoneNumber: normalizeSubmissionPhoneNumber(form.phoneNumber),
                email: trimmedEmail || null,
                message: trimmedMessage || null,
            }),
            schema: membershipApplicationSubmissionSchema,
        });

        const created = response.status === 201
            ? true
            : response.status === 200
                ? Boolean(response.data.created)
                : response.data.created;

        return {
            ok: true,
            data: {
                id: response.data.id,
                status: response.data.status,
                created,
            },
        };
    } catch (error) {
        const message = resolveMembershipApplicationErrorMessage(error);
        return { ok: false, message };
    }
}


export async function submitMembershipApplicationAction(...args: Parameters<typeof submitMembershipApplicationActionImpl>) {
    return captureAction(() => submitMembershipApplicationActionImpl(...args));
}
