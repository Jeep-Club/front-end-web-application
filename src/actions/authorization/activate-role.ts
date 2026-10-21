// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/authorization/activate-role";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function activateRoleAction(...args: Parameters<typeof server.activateRoleAction>) {
    return unwrapActionResult(await server.activateRoleAction(...args));
}
