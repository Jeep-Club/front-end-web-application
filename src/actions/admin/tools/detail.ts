// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/tools/detail";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function getToolDetailAdminAction(...args: Parameters<typeof server.getToolDetailAdminAction>) {
    return unwrapActionResult(await server.getToolDetailAdminAction(...args));
}
