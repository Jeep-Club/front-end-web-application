// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/tools/deactivate";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function deactivateToolAdminAction(...args: Parameters<typeof server.deactivateToolAdminAction>) {
    return unwrapActionResult(await server.deactivateToolAdminAction(...args));
}
