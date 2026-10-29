'use server';

import {
	accessLinkApprovalSchema,
	membershipApplicationPageSchema,
	temporaryPasswordApprovalSchema,
} from '@/schemas/membership/application';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { HttpAPIRoutes } from '@/utils/http/api';
import { z } from 'zod';
import { adminTemporaryPasswordResponseSchema } from '@/schemas/auth/recovery';

const noContentSchema = z.literal('');
const byId = (route: string, id: number) => route.replace('{id}', String(id));

export async function listMembershipApplicationsAction({ page, status }: { page: number; status?: MembershipApplicationStatus }) {
    const params = new URLSearchParams({ page: String(page), size: '20', sort: 'requestedAt,desc' });
    if (status) params.set('status', status);
    const result = await actionFetchWrapper<MembershipApplicationPage>({
        url: `${HttpAPIRoutes.ADMIN_MEMBERSHIP_APPLICATIONS}?${params}`,
        method: 'GET',
        schema: membershipApplicationPageSchema,
    });
    return result.data;
}

export async function approveMembershipApplicationWithTemporaryPasswordAction(id: number) {
    const result = await actionFetchWrapper<TemporaryPasswordApproval>({
        url: byId(HttpAPIRoutes.ADMIN_MEMBERSHIP_APPLICATION_APPROVE_TEMPORARY_PASSWORD, id),
        method: 'POST',
        schema: temporaryPasswordApprovalSchema,
    });
    return result.data;
}

export async function approveMembershipApplicationWithLinkAction(id: number) {
    const result = await actionFetchWrapper<AccessLinkApproval>({
        url: byId(HttpAPIRoutes.ADMIN_MEMBERSHIP_APPLICATION_APPROVE_ACCESS_LINK, id),
        method: 'POST',
        schema: accessLinkApprovalSchema,
    });
    return result.data;
}

export async function resendMembershipActivationLinkAction(id: number) {
    await actionFetchWrapper({
        url: byId(HttpAPIRoutes.ADMIN_MEMBERSHIP_APPLICATION_RESEND_ACTIVATION_LINK, id),
        method: 'POST', schema: noContentSchema,
    });
}

export async function rejectMembershipApplicationAction(id: number, reason: string) {
    await actionFetchWrapper({
        url: byId(HttpAPIRoutes.ADMIN_MEMBERSHIP_APPLICATION_REJECT, id),
        method: 'POST',
        body: JSON.stringify({ reason: reason.trim() || null }),
        schema: noContentSchema,
    });
}

export async function rejectAndBlockMembershipApplicantAction(id: number, reason: string) {
    await actionFetchWrapper({
        url: byId(HttpAPIRoutes.ADMIN_MEMBERSHIP_APPLICATION_REJECT_AND_BLOCK, id),
        method: 'POST',
        body: JSON.stringify({ reason: reason.trim() }),
        schema: noContentSchema,
    });
}

export async function generateUserTemporaryPasswordAction(userId: number) {
    const result = await actionFetchWrapper({
        url: HttpAPIRoutes.ADMIN_USER_TEMPORARY_PASSWORD.replace('{userId}', String(userId)),
        method: 'POST',
        schema: adminTemporaryPasswordResponseSchema,
    });
    return { userId, ...result.data };
}
