// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/users/activation-invitation";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function getUserActivationInvitationAction(...args: Parameters<typeof server.getUserActivationInvitationAction>) {
    return unwrapActionResult(await server.getUserActivationInvitationAction(...args));
}

export async function resendUserActivationInvitationAction(...args: Parameters<typeof server.resendUserActivationInvitationAction>) {
    return unwrapActionResult(await server.resendUserActivationInvitationAction(...args));
}

export async function revokeUserActivationInvitationAction(...args: Parameters<typeof server.revokeUserActivationInvitationAction>) {
    return unwrapActionResult(await server.revokeUserActivationInvitationAction(...args));
}
