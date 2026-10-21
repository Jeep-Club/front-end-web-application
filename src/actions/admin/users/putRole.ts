// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/users/putRole";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function putUserRoleAction(...args: Parameters<typeof server.putUserRoleAction>) {
    return unwrapActionResult(await server.putUserRoleAction(...args));
}
