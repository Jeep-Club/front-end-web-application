// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/tools/create";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function createToolAdminAction(...args: Parameters<typeof server.createToolAdminAction>) {
    return unwrapActionResult(await server.createToolAdminAction(...args));
}
