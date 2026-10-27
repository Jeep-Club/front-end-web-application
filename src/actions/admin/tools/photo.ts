// Client-safe adapter: expected failures cross the server boundary as data.
import * as server from "@/server/actions/admin/tools/photo";
import { unwrapActionResult } from "@/utils/actions/actionResult";

export async function updateToolPhotoAdminAction(...args: Parameters<typeof server.updateToolPhotoAdminAction>) {
    return unwrapActionResult(await server.updateToolPhotoAdminAction(...args));
}
