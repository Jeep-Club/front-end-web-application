// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/membership-applications";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function listMembershipApplicationsAction(...args: Parameters<typeof server.listMembershipApplicationsAction>) {
    return unwrapActionResult(await server.listMembershipApplicationsAction(...args));
}

export async function approveMembershipApplicationWithTemporaryPasswordAction(...args: Parameters<typeof server.approveMembershipApplicationWithTemporaryPasswordAction>) {
    return unwrapActionResult(await server.approveMembershipApplicationWithTemporaryPasswordAction(...args));
}

export async function approveMembershipApplicationWithLinkAction(...args: Parameters<typeof server.approveMembershipApplicationWithLinkAction>) {
    return unwrapActionResult(await server.approveMembershipApplicationWithLinkAction(...args));
}

export async function resendMembershipActivationLinkAction(...args: Parameters<typeof server.resendMembershipActivationLinkAction>) {
    return unwrapActionResult(await server.resendMembershipActivationLinkAction(...args));
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

export async function rejectAndBlockMembershipApplicantAction(...args: Parameters<typeof server.rejectAndBlockMembershipApplicantAction>) {
    return unwrapActionResult(await server.rejectAndBlockMembershipApplicantAction(...args));
}
