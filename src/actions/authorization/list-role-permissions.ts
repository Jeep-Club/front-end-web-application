// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/authorization/list-role-permissions";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function listRolePermissionsAction(...args: Parameters<typeof server.listRolePermissionsAction>) {
    return unwrapActionResult(await server.listRolePermissionsAction(...args));
}
