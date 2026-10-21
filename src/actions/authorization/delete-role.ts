// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/authorization/delete-role";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function deleteRoleAction(...args: Parameters<typeof server.deleteRoleAction>) {
    return unwrapActionResult(await server.deleteRoleAction(...args));
}
