// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/authorization/revoke-role-from-user";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function revokeRoleFromUserAction(...args: Parameters<typeof server.revokeRoleFromUserAction>) {
    return unwrapActionResult(await server.revokeRoleFromUserAction(...args));
}
