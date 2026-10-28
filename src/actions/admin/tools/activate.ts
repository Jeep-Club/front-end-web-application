// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/tools/activate";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function activateToolAdminAction(...args: Parameters<typeof server.activateToolAdminAction>) {
    return unwrapActionResult(await server.activateToolAdminAction(...args));
}
