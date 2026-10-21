// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/users/list";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function listAdminUsersAction(...args: Parameters<typeof server.listAdminUsersAction>) {
    return unwrapActionResult(await server.listAdminUsersAction(...args));
}
