// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/security/index";
import { unwrapActionResult } from "@/utils/actions/actionResult";
export type { AdminSession, AdminRefreshToken, AdminPasswordRecoveryRequest } from "@/server/actions/admin/security/index";

export async function listAdminUserSessionsAction(...args: Parameters<typeof server.listAdminUserSessionsAction>) {
    return unwrapActionResult(await server.listAdminUserSessionsAction(...args));
}

export async function logoutAdminSessionAction(...args: Parameters<typeof server.logoutAdminSessionAction>) {
    return unwrapActionResult(await server.logoutAdminSessionAction(...args));
}

export async function listAdminUserRefreshTokensAction(...args: Parameters<typeof server.listAdminUserRefreshTokensAction>) {
    return unwrapActionResult(await server.listAdminUserRefreshTokensAction(...args));
}

export async function revokeAdminRefreshTokenAction(...args: Parameters<typeof server.revokeAdminRefreshTokenAction>) {
    return unwrapActionResult(await server.revokeAdminRefreshTokenAction(...args));
}

export async function listAdminUserPasswordRecoveryRequestsAction(...args: Parameters<typeof server.listAdminUserPasswordRecoveryRequestsAction>) {
    return unwrapActionResult(await server.listAdminUserPasswordRecoveryRequestsAction(...args));
}

export async function cancelAdminPasswordRecoveryRequestAction(...args: Parameters<typeof server.cancelAdminPasswordRecoveryRequestAction>) {
    return unwrapActionResult(await server.cancelAdminPasswordRecoveryRequestAction(...args));
}
