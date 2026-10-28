'use server';

import { membershipApplicationSubmissionSchema } from '@/schemas/membership/application';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { HttpAPIRoutes } from '@/utils/http/api';
import { unMaskCPF } from '@/utils/masks/maskCPF';
import { unMaskPhoneNumber } from '@/utils/masks/maskPhoneNumber';

export async function submitMembershipApplicationAction(form: MembershipApplicationForm): Promise<MembershipApplicationSubmission> {
    const response = await actionFetchWrapper<MembershipApplicationSubmission>({
        url: HttpAPIRoutes.MEMBERSHIP_APPLICATIONS,
        method: 'POST',
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
    return response.data;
}
