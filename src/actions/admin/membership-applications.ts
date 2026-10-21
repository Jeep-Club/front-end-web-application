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

export async function rejectMembershipApplicationAction(...args: Parameters<typeof server.rejectMembershipApplicationAction>) {
    return unwrapActionResult(await server.rejectMembershipApplicationAction(...args));
}

export async function rejectAndBlockMembershipApplicantAction(...args: Parameters<typeof server.rejectAndBlockMembershipApplicantAction>) {
    return unwrapActionResult(await server.rejectAndBlockMembershipApplicantAction(...args));
}
