// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/authorization/assign-role-to-user";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function assignRoleToUserAction(...args: Parameters<typeof server.assignRoleToUserAction>) {
    return unwrapActionResult(await server.assignRoleToUserAction(...args));
}
