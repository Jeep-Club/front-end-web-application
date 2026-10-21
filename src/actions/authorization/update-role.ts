// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/authorization/update-role";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function updateRoleAction(...args: Parameters<typeof server.updateRoleAction>) {
    return unwrapActionResult(await server.updateRoleAction(...args));
}
