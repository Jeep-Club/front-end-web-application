// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/authorization/assign-role-permission";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function assignPermissionToRoleAction(...args: Parameters<typeof server.assignPermissionToRoleAction>) {
    return unwrapActionResult(await server.assignPermissionToRoleAction(...args));
}
