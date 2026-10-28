// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/tools/list";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function listToolsAdminAction(...args: Parameters<typeof server.listToolsAdminAction>) {
    return unwrapActionResult(await server.listToolsAdminAction(...args));
}
