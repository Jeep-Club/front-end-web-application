// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/auth/activate-account-invitation";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function validateAccountActivationInvitationAction(...args: Parameters<typeof server.validateAccountActivationInvitationAction>) {
    return unwrapActionResult(await server.validateAccountActivationInvitationAction(...args));
}

export async function activateAccountWithInvitationAction(...args: Parameters<typeof server.activateAccountWithInvitationAction>) {
    return unwrapActionResult(await server.activateAccountWithInvitationAction(...args));
}
