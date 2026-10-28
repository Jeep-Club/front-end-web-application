// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/tools/delete";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function deleteToolAdminAction(...args: Parameters<typeof server.deleteToolAdminAction>) {
    return unwrapActionResult(await server.deleteToolAdminAction(...args));
}
