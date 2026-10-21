// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/authorization/deactivate-role";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function deactivateRoleAction(...args: Parameters<typeof server.deactivateRoleAction>) {
    return unwrapActionResult(await server.deactivateRoleAction(...args));
}
