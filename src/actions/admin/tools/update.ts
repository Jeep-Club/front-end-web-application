// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/tools/update";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function updateToolAdminAction(...args: Parameters<typeof server.updateToolAdminAction>) {
    return unwrapActionResult(await server.updateToolAdminAction(...args));
}
