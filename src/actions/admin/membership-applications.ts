'use server';

import { z } from 'zod';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import {
    accessLinkApprovalSchema,
    membershipApplicationPageSchema,
    temporaryPasswordApprovalSchema,
} from '@/schemas/membership/application';
import { HttpAPIRoutes } from '@/utils/http/api';
import { extractApiErrorMessage } from '@/utils/http/apiError';

const noContentSchema = z.literal('');
const byId = (route: string, id: number) => route.replace('{id}', String(id));

export async function listMembershipApplicationsAction({ page, status }: { page: number; status?: MembershipApplicationStatus }) {
    const params = new URLSearchParams({ page: String(page), size: '20', sort: 'requestedAt,desc' });
    if (status) params.set('status', status);
    try {
        const result = await actionFetchWrapper<MembershipApplicationPage>({
            url: `${HttpAPIRoutes.ADMIN_MEMBERSHIP_APPLICATIONS}?${params}`,
            method: 'GET',
            schema: membershipApplicationPageSchema,
        });
        return result.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Não foi possível carregar as solicitações de associação.'), { cause: error });
    }
}

export async function approveMembershipApplicationWithTemporaryPasswordAction(id: number) {
    try {
        const result = await actionFetchWrapper<TemporaryPasswordApproval>({
            url: byId(HttpAPIRoutes.ADMIN_MEMBERSHIP_APPLICATION_APPROVE_TEMPORARY_PASSWORD, id),
            method: 'POST',
            schema: temporaryPasswordApprovalSchema,
        });
        return result.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Não foi possível aprovar a solicitação.'), { cause: error });
    }
}

export async function approveMembershipApplicationWithLinkAction(id: number) {
    try {
        const result = await actionFetchWrapper<AccessLinkApproval>({
            url: byId(HttpAPIRoutes.ADMIN_MEMBERSHIP_APPLICATION_APPROVE_ACCESS_LINK, id),
            method: 'POST',
            schema: accessLinkApprovalSchema,
        });
        return result.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Não foi possível aprovar e enviar o convite.'), { cause: error });
    }
}

export async function resendMembershipActivationLinkAction(id: number) {
    try {
        await actionFetchWrapper({
            url: byId(HttpAPIRoutes.ADMIN_MEMBERSHIP_APPLICATION_RESEND_ACTIVATION_LINK, id),
            method: 'POST', schema: noContentSchema,
        });
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Não foi possível reenviar o convite.'), { cause: error });
    }
}

export async function generateUserTemporaryPasswordAction(userId: number) {
    try {
        const result = await actionFetchWrapper<TemporaryPasswordApproval>({
            url: HttpAPIRoutes.ADMIN_USER_TEMPORARY_PASSWORD.replace('{userId}', String(userId)),
            method: 'POST',
            schema: temporaryPasswordApprovalSchema,
        });
        return result.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Não foi possível gerar a senha provisória.'), { cause: error });
    }
}

export async function rejectMembershipApplicationAction(id: number, reason: string) {
    try {
        await actionFetchWrapper({
            url: byId(HttpAPIRoutes.ADMIN_MEMBERSHIP_APPLICATION_REJECT, id),
            method: 'POST',
            body: JSON.stringify({ reason: reason.trim() || null }),
            schema: noContentSchema,
        });
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Não foi possível rejeitar a solicitação.'), { cause: error });
    }
}

export async function rejectAndBlockMembershipApplicantAction(id: number, reason: string) {
    try {
        await actionFetchWrapper({
            url: byId(HttpAPIRoutes.ADMIN_MEMBERSHIP_APPLICATION_REJECT_AND_BLOCK, id),
            method: 'POST',
            body: JSON.stringify({ reason: reason.trim() }),
            schema: noContentSchema,
        });
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Não foi possível rejeitar a solicitação e bloquear o CPF.'), { cause: error });
    }
}
