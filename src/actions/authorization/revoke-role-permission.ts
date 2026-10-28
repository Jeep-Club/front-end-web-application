// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/authorization/revoke-role-permission";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function revokePermissionFromRoleAction(...args: Parameters<typeof server.revokePermissionFromRoleAction>) {
    return unwrapActionResult(await server.revokePermissionFromRoleAction(...args));
}
