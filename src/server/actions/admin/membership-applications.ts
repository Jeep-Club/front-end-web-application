'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

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

async function listMembershipApplicationsActionImpl({ page, status }: { page: number; status?: MembershipApplicationStatus }) {
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
        throw new ActionError(extractApiErrorMessage(error, 'Não foi possível carregar as solicitações de associação.'), { cause: error });
    }
}

async function approveMembershipApplicationWithTemporaryPasswordActionImpl(id: number) {
    try {
        const result = await actionFetchWrapper<TemporaryPasswordApproval>({
            url: byId(HttpAPIRoutes.ADMIN_MEMBERSHIP_APPLICATION_APPROVE_TEMPORARY_PASSWORD, id),
            method: 'POST',
            schema: temporaryPasswordApprovalSchema,
        });
        return result.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Não foi possível aprovar a solicitação.'), { cause: error });
    }
}

async function approveMembershipApplicationWithLinkActionImpl(id: number) {
    try {
        const result = await actionFetchWrapper<AccessLinkApproval>({
            url: byId(HttpAPIRoutes.ADMIN_MEMBERSHIP_APPLICATION_APPROVE_ACCESS_LINK, id),
            method: 'POST',
            schema: accessLinkApprovalSchema,
        });
        return result.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Não foi possível aprovar e enviar o convite.'), { cause: error });
    }
}

async function resendMembershipActivationLinkActionImpl(id: number) {
    try {
        await actionFetchWrapper({
            url: byId(HttpAPIRoutes.ADMIN_MEMBERSHIP_APPLICATION_RESEND_ACTIVATION_LINK, id),
            method: 'POST', schema: noContentSchema,
        });
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Não foi possível reenviar o convite.'), { cause: error });
    }
}

async function rejectMembershipApplicationActionImpl(id: number, reason: string) {
    try {
        await actionFetchWrapper({
            url: byId(HttpAPIRoutes.ADMIN_MEMBERSHIP_APPLICATION_REJECT, id),
            method: 'POST',
            body: JSON.stringify({ reason: reason.trim() || null }),
            schema: noContentSchema,
        });
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Não foi possível rejeitar a solicitação.'), { cause: error });
    }
}

async function rejectAndBlockMembershipApplicantActionImpl(id: number, reason: string) {
    try {
        await actionFetchWrapper({
            url: byId(HttpAPIRoutes.ADMIN_MEMBERSHIP_APPLICATION_REJECT_AND_BLOCK, id),
            method: 'POST',
            body: JSON.stringify({ reason: reason.trim() }),
            schema: noContentSchema,
        });
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Não foi possível rejeitar a solicitação e bloquear o CPF.'), { cause: error });
    }
}


export async function listMembershipApplicationsAction(...args: Parameters<typeof listMembershipApplicationsActionImpl>) {
    return captureAction(() => listMembershipApplicationsActionImpl(...args));
}


export async function approveMembershipApplicationWithTemporaryPasswordAction(...args: Parameters<typeof approveMembershipApplicationWithTemporaryPasswordActionImpl>) {
    return captureAction(() => approveMembershipApplicationWithTemporaryPasswordActionImpl(...args));
}


export async function approveMembershipApplicationWithLinkAction(...args: Parameters<typeof approveMembershipApplicationWithLinkActionImpl>) {
    return captureAction(() => approveMembershipApplicationWithLinkActionImpl(...args));
}


export async function resendMembershipActivationLinkAction(...args: Parameters<typeof resendMembershipActivationLinkActionImpl>) {
    return captureAction(() => resendMembershipActivationLinkActionImpl(...args));
}


export async function rejectMembershipApplicationAction(...args: Parameters<typeof rejectMembershipApplicationActionImpl>) {
    return captureAction(() => rejectMembershipApplicationActionImpl(...args));
}


export async function rejectAndBlockMembershipApplicantAction(...args: Parameters<typeof rejectAndBlockMembershipApplicantActionImpl>) {
    return captureAction(() => rejectAndBlockMembershipApplicantActionImpl(...args));
}
